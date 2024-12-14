import { query, Request, Response } from "express";
import { and, eq, inArray, not } from "drizzle-orm";
import { projectsGroupsTable, projectsTable, projectsUsersTable } from "../../db/projectsSchema.js";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/usersSchema.js";
import { groupsTable } from "../../db/groupsSchema.js";

// Types
interface ProjectData {
  project_name?: string;
  latitude?: number;
  longitude?: number;
  project_description?: string;
  project_status?: string;
}

// Validation helpers
const isValidCoordinates = (lat?: number, lng?: number): boolean => {
  if (lat === undefined || lng === undefined) return false;
  return !isNaN(lat) && !isNaN(lng);
};

// Database query helpers
const findProjectByName = async (
  companyId: string,
  projectName: string,
  excludeProjectId?: string
) => {
  let query = db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.company_id, Number(companyId)),
        eq(projectsTable.project_name, projectName)
      )
    );

  if (excludeProjectId) {
    query = query.where(
      and(
        not(eq(projectsTable.project_id, Number(excludeProjectId))),
        eq(projectsTable.company_id, Number(companyId)),
        eq(projectsTable.project_name, projectName)
      )
    );
  }
  return await query.limit(1);
};

const findProjectByLocation = async (
  companyId: string,
  lat: number,
  lng: number,
  excludeProjectId?: string
) => {
  let query = db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.company_id, Number(companyId)),
        eq(projectsTable.latitude, lat),
        eq(projectsTable.longitude, lng)
      )
    );

  if (excludeProjectId) {
    query = query.where(
      and(
        not(eq(projectsTable.project_id, Number(excludeProjectId))),
        eq(projectsTable.company_id, Number(companyId)),
        eq(projectsTable.latitude, lat),
        eq(projectsTable.longitude, lng)
      )
    );
  }

  return await query.limit(1);
};

// Controller functions
export const getProjects = async (req: Request, res: Response) => {
  try {
    const { company_id } = req.company;
    const projects = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.company_id, company_id),
          eq(projectsTable.project_is_deleted, false)
        )
      );
    res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const { userId } = req;
  const { company_id, company_name } = req.company;
  const projectData: ProjectData = req.cleanBody;

  try {
    // Validate project name uniqueness
    const existingProject = await findProjectByName(
      company_id,
      projectData.project_name!
    );
    if (existingProject.length > 0) {
      return res.status(400).json({
        error: `Project name ${projectData.project_name} already exists for company: ${company_name}`,
      });
    }

    // Validate coordinates
    if (!isValidCoordinates(projectData.latitude, projectData.longitude)) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude values" });
    }

    // Check location uniqueness
    const existingLocation = await findProjectByLocation(
      company_id,
      projectData.latitude!,
      projectData.longitude!
    );
    if (existingLocation.length > 0) {
      return res.status(400).json({
        error: `Project already exists at location (${projectData.latitude}, ${projectData.longitude})`,
      });
    }

    const project = await db
      .insert(projectsTable)
      .values({
        ...projectData,
        company_id,
        created_by: userId,
        updated_by: userId,
      })
      .returning();

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { company_id, company_name } = req.company;

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const { project_id } = req.params;
  const { userId } = req;
  const { company_id, company_name } = req.company;
  const updateData: ProjectData = req.cleanBody;

  try {
    // Verify project exists
    const projectExists = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, project_id),
          eq(projectsTable.company_id, company_id),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!projectExists.length) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    const updates: any = {
      updated_by: userId,
      updated_at: new Date(),
    };

    // Handle project name update
    if (updateData.project_name) {
      const nameExists = await findProjectByName(
        company_id,
        updateData.project_name,
        project_id
      );
      if (nameExists.length > 0) {
        return res.status(400).json({
          error: `Project name ${updateData.project_name} already exists at company: ${company_name}`,
        });
      }
      updates.project_name = updateData.project_name;
    }

    // Handle location update
    if (
      updateData.latitude !== undefined ||
      updateData.longitude !== undefined
    ) {
      if (!isValidCoordinates(updateData.latitude, updateData.longitude)) {
        return res.status(400).json({
          error: "Both latitude and longitude must be valid numbers",
        });
      }

      const locationExists = await findProjectByLocation(
        company_id,
        updateData.latitude!,
        updateData.longitude!,
        project_id
      );
      if (locationExists.length > 0) {
        return res.status(400).json({
          error: `Location (${updateData.latitude}, ${updateData.longitude}) already in use`,
        });
      }
      updates.latitude = updateData.latitude;
      updates.longitude = updateData.longitude;
    }

    // Add other fields if provided
    if (updateData.project_description)
      updates.project_description = updateData.project_description;
    if (updateData.project_status)
      updates.project_status = updateData.project_status;

    if (Object.keys(updates).length <= 2) {
      return res
        .status(400)
        .json({ error: "No valid fields provided for update" });
    }

    const project = await db
      .update(projectsTable)
      .set(updates)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id))
        )
      )
      .returning();

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { userId } = req;
    const { company_id } = req.company;

    const project = await db
      .update(projectsTable)
      .set({
        project_is_deleted: true,
        updated_by: userId,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .returning();

    console.log(project);
    if (project.length === 0) {
      res.status(404).json({ message: "project not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const assignUsersToProject = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { company_id, company_name } = req.company;
    const { user_ids } = req.body;

    // Validate project exists
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
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
      .from(projectsUsersTable)
      .where(
        and(
          eq(projectsUsersTable.project_id, Number(project_id)),
          inArray(projectsUsersTable.user_id, user_ids.map(Number))
        )
      );

    if (existingAssignments.length > 0) {
      const duplicateUserIds = existingAssignments.map(
        (assignment) => assignment.user_id
      );
      return res.status(400).json({
        error: `Users with IDs: ${duplicateUserIds.join(
          ", "
        )} are already assigned to this project name: ${project.project_name}`,
      });
    }

    // Create new assignments in transaction
    await db.transaction(async (tx) => {
      const assignments = user_ids.map((user_id) => ({
        project_id: Number(project_id),
        user_id: Number(user_id),
      }));

      await tx.insert(projectsUsersTable).values(assignments);
    });

    return res.status(200).json({
      message: `Users successfully assigned to project: ${project.project_name}`,
    });
  } catch (error) {
    console.error("Error in assignUsersToProject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unassignUsersFromProject = async (req: Request, res: Response) => {
  const { project_id } = req.params;
  const { user_ids } = req.body;
  const { company_id, company_name } = req.company;

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
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

    // Check for if users are already assigned to the project
    const existingAssignments = await db
      .select()
      .from(projectsUsersTable)
      .where(
        and(
          eq(projectsUsersTable.project_id, Number(project_id)),
          inArray(projectsUsersTable.user_id, user_ids.map(Number))
        )
      );

    if (existingAssignments.length !== user_ids.length) {
      const foundUserIds = existingAssignments.map((user) => user.user_id);
      const missingUserIds = user_ids.filter(
        (id) => !foundUserIds.includes(Number(id))
      );
      return res.status(400).json({
        error: `Users with IDs: ${missingUserIds.join(
          ", "
        )} are not assigned to this project name: ${project.project_name}`,
      });
    }

    // delete assignments in transaction
    await db.transaction(async (tx) => {
      await tx
        .delete(projectsUsersTable)
        .where(
          and(
            eq(projectsUsersTable.project_id, Number(project_id)),
            inArray(projectsUsersTable.user_id, user_ids.map(Number))
          )
        );
    });

    return res.status(200).json({
      message: `Users successfully unassigned from project: ${project.project_name}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const assignGroupsToProject = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { company_id, company_name } = req.company;
    const { group_ids } = req.body;

    // Validate project exists
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    // Validate all groups exist before starting transaction
    const groups = await db
      .select()
      .from(groupsTable)
      .where(
        and(
          inArray(groupsTable.group_id, group_ids.map(Number)),
          eq(groupsTable.company_id, Number(company_id))
        )
      );

    if (groups.length !== group_ids.length) {
      const foundGroupIds = groups.map((group) => group.group_id);
      const missingGroupIds = group_ids.filter(
        (id) => !foundGroupIds.includes(Number(id))
      );
      return res.status(404).json({
        error: `Groups with IDs: ${missingGroupIds.join(
          ", "
        )} not found in company: ${company_name}`,
      });
    }

    // Check for existing assignments
    const existingAssignments = await db
      .select()
      .from(projectsGroupsTable)
      .where(
        and(
          eq(projectsGroupsTable.project_id, Number(project_id)),
          inArray(projectsGroupsTable.group_id, group_ids.map(Number))
        )
      );

    if (existingAssignments.length > 0) {
      const duplicateGroupIds = existingAssignments.map(
        (assignment) => assignment.group_id
      );
      return res.status(400).json({
        error: `Groups with IDs: ${duplicateGroupIds.join(
          ", "
        )} are already assigned to this project name: ${project.project_name}`,
      });
    }

    // Create new assignments in transaction
    await db.transaction(async (tx) => {
      const assignments = group_ids.map((group_id) => ({
        project_id: Number(project_id),
        group_id: Number(group_id),
      }));

      await tx.insert(projectsGroupsTable).values(assignments);
    });

    return res.status(200).json({
      message: `Groups successfully assigned to project: ${project.project_name}`,
    });
  } catch (error) {
    console.error("Error in assignGroupsToProject:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unassignGroupsFromProject = async (req: Request, res: Response) => {
  const { project_id } = req.params;
  const { group_ids } = req.body;
  const { company_id, company_name } = req.company;

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.project_id, Number(project_id)),
          eq(projectsTable.company_id, Number(company_id)),
          eq(projectsTable.project_is_deleted, false)
        )
      )
      .limit(1);

    if (!project) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    // Validate all groups exist before starting transaction
    const groups = await db
      .select()
      .from(groupsTable)
      .where(
        and(
          inArray(groupsTable.group_id, group_ids.map(Number)),
          eq(groupsTable.company_id, Number(company_id))
        )
      );

    if (groups.length !== group_ids.length) {
      const foundGroupIds = groups.map((group) => group.group_id);
      const missingGroupIds = group_ids.filter(
        (id) => !foundGroupIds.includes(Number(id))
      );
      return res.status(404).json({
        error: `Groups with IDs: ${missingGroupIds.join(
          ", "
        )} not found in company: ${company_name}`,
      });
    }

    // Check for if users are already assigned to the project
    const existingAssignments = await db
      .select()
      .from(projectsUsersTable)
      .where(
        and(
          eq(projectsGroupsTable.project_id, Number(project_id)),
          inArray(projectsGroupsTable.group_id, group_ids.map(Number))
        )
      );

    if (existingAssignments.length !== group_ids.length) {
      const foundGroupIds = existingAssignments.map((group) => group.group_id);
      const missingGroupIds = group_ids.filter(
        (id) => !foundGroupIds.includes(Number(id))
      );
      return res.status(400).json({
        error: `Groups with IDs: ${missingGroupIds.join(
          ", "
        )} are not assigned to this project name: ${project.project_name}`,
      });
    }

    // delete assignments in transaction
    await db.transaction(async (tx) => {
      await tx
        .delete(projectsUsersTable)
        .where(
          and(
            eq(projectsGroupsTable.project_id, Number(project_id)),
            inArray(projectsGroupsTable.group_id, group_ids.map(Number))
          )
        );
    });

    return res.status(200).json({
      message: `Groups successfully unassigned from project: ${project.project_name}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
