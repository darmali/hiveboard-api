import { boolean, integer, pgTable, varchar, text, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { occupationsTable } from "./occupationsSchema";
import { pgEnum } from "drizzle-orm/pg-core";
import { companiesTable } from "./companiesSchema";
import { z } from "zod";
import { groupsTable } from "./groupsSchema";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "company_admin",
  "project_manager",
  "project_member",
]);
export const userTypeEnum = pgEnum("user_type", [
  "registered_user",
  "invited_user",
]);
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "pending",
  "inactive",
  "deleted",
]);

export const usersTable = pgTable("users", {
  user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_first_name: varchar({ length: 255 }).notNull(),
  user_last_name: varchar({ length: 255 }).notNull(),
  user_phone: varchar({ length: 255 }).notNull(),
  user_occupation_id: integer().references(() => occupationsTable.occupation_id),
  user_email: varchar({ length: 255 }).notNull().unique(),
  user_password: varchar({ length: 255 }).notNull(),
  user_role: userRoleEnum("user_role").notNull().default("company_admin"),
  user_type: userTypeEnum("user_type").notNull().default("registered_user"),
  user_company_id: integer().references(() => companiesTable.company_id),
  user_status: userStatusEnum("user_status").notNull().default("pending"),
  user_is_deleted: boolean().default(false),
});

export const usersGroupsTable = pgTable("users_groups", {
  user_id: integer().references(() => usersTable.user_id),
  group_id: integer().references(() => groupsTable.group_id),
}, table => ({
    pk: primaryKey({ columns: [table.user_id, table.group_id] }),
  })
);

export const createUserSchema = createInsertSchema(usersTable).omit({
  user_id: true,
  role: true,
});

export const createUserWithCompanySchema = createInsertSchema(usersTable)
  .omit({
    user_id: true,
    role: true,
    company_id: true,
    status: true,
    type: true,
  })
  .extend({
    phone: z
      .string()
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Invalid phone number format. Please use E.164 format (e.g., +12345678901)"
      ),
  })
  .merge(
    createInsertSchema(companiesTable).omit({
      company_id: true,
      company_is_deleted: true,
    })
  );

export const loginSchema = createInsertSchema(usersTable).pick({
  email: true,
  password: true,
});
