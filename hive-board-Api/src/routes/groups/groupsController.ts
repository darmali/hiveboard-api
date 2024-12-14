import { eq, inArray, and } from "drizzle-orm";
import { db } from "../../db";
import { groupsTable } from "../../db/groupsSchema";
import { usersTable } from "../../db/usersSchema";
import { usersGroupsTable } from "../../db/usersSchema";
import { sanitizeData } from "../../utils/dbHelper";
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
      .where(
        and(
          eq(groupsTable.group_name, createData.group_name),
          eq(groupsTable.group_is_deleted, false),
          eq(groupsTable.company_id, company_id)
        )
      ).limit(1);

    if (existingGroup.length > 0) {
      return res.status(400).json({
        message: `Group ${createData.group_name} already exists at ${company_name}`,
      });
    }

    const [group] = await db.insert(groupsTable).values(createData).returning();

    const safeGroup = sanitizeData(group, ['group_id', 'group_name', 'group_description']);
    res.status(201).json(safeGroup);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { group_id } = req.params;
    const updateData: GroupData = req.cleanBody;
    updateData.updated_by = userId;
    updateData.updated_at = new Date();

    const existingGroup = await db
      .select()
      .from(groupsTable)
      .where(
        and(
          eq(groupsTable.group_id, group_id),
          eq(groupsTable.group_is_deleted, false)
        )
      );

    if (!existingGroup) {
      return res.status(404).json({ message: `Group ${group_id} not found` });
    }

    const [updatedGroup] = await db
      .update(groupsTable)
      .set(updateData)
      .where(eq(groupsTable.group_id, group_id))
      .returning();
    const safeGroup = sanitizeData(updatedGroup, ['group_id', 'group_name', 'group_description']);
    res.status(200).json(safeGroup);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { userId } = req;
    const { group_id } = req.params;
    const deleteData: GroupData = {};

    deleteData.updated_by = userId;
    deleteData.updated_at = new Date();
    deleteData.group_is_deleted = true;

    const [deletedGroup] = await db
      .update(groupsTable)
      .set(deleteData)
      .where(and(
        eq(groupsTable.group_id, group_id),
        eq(groupsTable.group_is_deleted, false)
      ))
      .returning();
    if (!deletedGroup) {
      return res.status(404).json({ message: `Group ${group_id} not found` });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  const { company_id } = req.company;
  try {
    const groups = await db
      .select()
      .from(groupsTable)
      .where(
        and(
          eq(groupsTable.company_id, company_id),
          eq(groupsTable.group_is_deleted, false)
        )
      );
    const safeGroups = groups.map((group) => sanitizeData(group, ['group_id', 'group_name', 'group_description']));

    res.status(200).json(safeGroups);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroup = async (req: Request, res: Response) => {
  const { group_id } = req.params;
  try {
    const [group] = await db
      .select()
      .from(groupsTable)
      .where(
        and(
          eq(groupsTable.group_id, group_id),
          eq(groupsTable.group_is_deleted, false)
        )
      );
    if (!group) {
      return res.status(404).json({ message: `Group ${group_id} not found` });
    } 
    const safeGroup = sanitizeData(group, ['group_id', 'group_name', 'group_description']);
    res.status(200).json(safeGroup);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const assignUsersToGroup = async (req: Request, res: Response) => {
    try {
      const { group_id } = req.params;
      const { company_id, company_name } = req.company;
      const { user_ids } = req.body;
  
      // Validate project exists
      const [group] = await db
        .select()
        .from(groupsTable)
        .where(
          and(
            eq(groupsTable.group_id, Number(group_id)),
            eq(groupsTable.company_id, Number(company_id)),
            eq(groupsTable.group_is_deleted, false)
          )
        )
        .limit(1);
  
      if (!group) {
        return res.status(404).json({
          error: `Group ${group_id} not found for company: ${company_name}`,
        });
      }
  
      // Validate all users exist before starting transaction
      const users = await db
        .select()
        .from(usersTable)
        .where(
          and(
            inArray(usersTable.user_id, user_ids.map(Number)),
            eq(usersTable.company_id, Number(company_id))
          )
        );
  
      if (users.length !== user_ids.length) {
        const foundUserIds = users.map((user) => user.user_id);
        const missingUserIds = user_ids.filter(
          (id) => !foundUserIds.includes(Number(id))
        );
        return res.status(404).json({
          error: `Users with IDs: ${missingUserIds.join(
            ", "
          )} not found in company: ${company_name}`,
        });
      }
  
      // Check for existing assignments
      const existingAssignments = await db
        .select()
        .from(usersGroupsTable)
        .where(
          and(
            eq(usersGroupsTable.group_id, Number(group_id)),
            inArray(usersGroupsTable.user_id, user_ids.map(Number))
          )
        );
  
      if (existingAssignments.length > 0) {
        const duplicateUserIds = existingAssignments.map(
          (assignment) => assignment.user_id
        );
        return res.status(400).json({
          error: `Users with IDs: ${duplicateUserIds.join(
            ", "
          )} are already assigned to this group name: ${group.group_name}`,
        });
      }
  
      // Create new assignments in transaction
      await db.transaction(async (tx) => {
        const assignments = user_ids.map((user_id) => ({
          group_id: Number(group_id),
          user_id: Number(user_id),
        }));
  
        await tx.insert(usersGroupsTable).values(assignments);
      });
  
      return res.status(200).json({
        message: `Users successfully assigned to group: ${group.group_name}`,
      });
    } catch (error) {
      console.error("Error in assignUsersToGroup:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
};

export const unassignUsersFromGroup = async (req: Request, res: Response) => {
    try {
      const { group_id } = req.params;
      const { company_id, company_name } = req.company;
      const { user_ids } = req.body;
  
      // Validate project exists
      const [group] = await db
        .select()
        .from(groupsTable)
        .where(
          and(
            eq(groupsTable.group_id, Number(group_id)),
            eq(groupsTable.company_id, Number(company_id)),
            eq(groupsTable.group_is_deleted, false)
          )
        )
        .limit(1);
  
      if (!group) {
        return res.status(404).json({
          error: `Group ${group_id} not found for company: ${company_name}`,
        });
      }
  
      // Validate all users exist before starting transaction
      const users = await db
        .select()
        .from(usersTable)
        .where(
          and(
            inArray(usersTable.user_id, user_ids.map(Number)),
            eq(usersTable.company_id, Number(company_id))
          )
        );
  
      if (users.length !== user_ids.length) {
        const foundUserIds = users.map((user) => user.user_id);
        const missingUserIds = user_ids.filter(
          (id) => !foundUserIds.includes(Number(id))
        );
        return res.status(404).json({
          error: `Users with IDs: ${missingUserIds.join(
            ", "
          )} not found in company: ${company_name}`,
        });
      }
  
      // Check for existing assignments
      const existingAssignments = await db
        .select()
        .from(usersGroupsTable)
        .where(
          and(
            eq(usersGroupsTable.group_id, Number(group_id)),
            inArray(usersGroupsTable.user_id, user_ids.map(Number))
          )
        );
  
        if (existingAssignments.length !== user_ids.length) {
            const foundUserIds = existingAssignments.map((user) => user.user_id);
            const missingUserIds = user_ids.filter(
              (id) => !foundUserIds.includes(Number(id))
            );
            return res.status(404).json({
              error: `Users with IDs: ${missingUserIds.join(
                ", "
              )} not found in company: ${company_name}`,
            });
          }
  
      // Create new assignments in transaction
      await db.transaction(async (tx) => {
        await tx.delete(usersGroupsTable).where(eq(usersGroupsTable.group_id, Number(group_id)));
      });
  
      return res.status(200).json({
        message: `Users successfully unassigned from group: ${group.group_name}`,
      });
    } catch (error) {
      console.error("Error in unassignUsersFromGroup:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
};