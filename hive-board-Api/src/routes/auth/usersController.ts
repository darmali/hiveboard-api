import { Request, Response } from "express";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/usersSchema.js";
import { not, eq, and, inArray } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sanitizeData } from "../../utils/dbHelper.js";
import { companiesTable } from "../../db/companiesSchema.js";

const generateUserToken = (user: any) => {
  return jwt.sign(
    {
      userId: user.user_id,
      role: user.user_role,
      email: user.user_email,
      firstName: user.user_first_name,
      lastName: user.user_last_name,
      phone: user.user_phone,
      company: user.company,
    },
    "your-secret",
    {
      expiresIn: "30d",
    }
  );
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(not(eq(usersTable.user_is_deleted, true)));
  res.json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.user_id, Number(id)));
  res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
  const { user } = req.body;
  const newUser = await db.insert(usersTable).values(user).returning();
  res.json(newUser);
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const data = req.cleanBody;

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.user_email, data.user_email))
      .limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Check if company name already exists
    const existingCompany = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.company_name, data.company_name))
      .limit(1);
    if (existingCompany.length > 0) {
      return res.status(400).json({ error: "Company name already registered" });
    }

    data.user_password = await bcrypt.hash(data.user_password, 10);
    const [company] = await db
      .insert(companiesTable)
      .values({
        company_name: data.company_name,
        company_size: data.company_size,
        company_is_deleted: false,
      })
      .returning();

    data.user_company_id = company.company_id;
    const [user] = await db.insert(usersTable).values(data).returning();

    // @ts-ignore
    delete user.password;

    res.status(201).json({ user });
  } catch (e) {
    console.error(`Error: ${e}`);
    res.status(500).json({ error: "Something went wrong during registration" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.cleanBody;

    const [users] = await db
      .select()
      .from(usersTable)
      .innerJoin(
        companiesTable,
        eq(usersTable.user_company_id, companiesTable.company_id)
      )
      .where(
        and(
          eq(usersTable.user_email, email),
          inArray(usersTable.user_status, ["active", "pending"]),
          not(eq(usersTable.user_is_deleted, true))
        )
      );
    if (!users) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }
    const user = { ...users.users, company: users.companies };
    //@ts-ignore
    const matched = await bcrypt.compare(password, user.user_password);
    if (!matched) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    //@ts-ignore
    if (user.user_status === "pending") {
      await db
        .update(usersTable)
        .set({ user_status: "active" })
        //@ts-ignore
        .where(eq(usersTable.user_id, user.user_id));
    }

    // create a jwt token
    const token = generateUserToken(user);

    const safeUser = sanitizeData(user, [
      "user_id",
      "user_email",
      "user_first_name",
      "user_last_name",
      "user_role",
      "user_phone",
      "company",
    ]);

    res.status(200).json({ token, user: safeUser });
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong");
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user } = req.body;
  const updatedUser = await db
    .update(usersTable)
    .set(user)
    .where(eq(usersTable.user_id, Number(id)));
  res.json(updatedUser);
};
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedUser = await db
    .update(usersTable)
    .set({ user_is_deleted: true })
    .where(eq(usersTable.user_id, Number(id)))
    .returning();
  res.json({ message: "User deleted", user: updatedUser });
};
