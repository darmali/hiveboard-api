import { db } from "../../db";
import { groupsTable } from "../../db/groupsSchema";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { company_id, company_name } = req.company;
    const createData: GroupData = req.cleanBody;
    
    createData.created_by = userId;
    createData.updated_by = userId;
    createData.company_id = company_id;

    const existingGroup = await db
      .select()
      .from(groupsTable)
      .where(and(
        eq(groupsTable.group_name, createData.group_name),
        eq(groupsTable.company_id, company_id)
      ));

    if (existingGroup) {
      return res.status(400).json({ message: `Group ${createData.group_name} already exists at ${company_name}` });
    }

    const group = await db.insert(groupsTable).values(createData).returning();
    res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
