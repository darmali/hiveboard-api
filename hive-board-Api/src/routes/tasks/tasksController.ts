import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tasksTable, tasksUsersTable } from "../../db/tasksSchema.js";
import { projectsTable, projectsUsersTable } from "../../db/projectsSchema.js";
import { Request, Response } from "express";
import { sanitizeData } from "../../utils/dbHelper.js";
import { usersTable } from "../../db/usersSchema.js";

const isProjectExists = async (project_id: number, company_id: number) => {
  const [projectExists] = await db
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
  return projectExists;
};

const isTaskExists = async (task_id: number, project_id: number) => {
  const [taskExists] = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.task_id, task_id),
        eq(tasksTable.project_id, project_id),
        eq(tasksTable.task_is_deleted, false)
      )
    )
    .limit(1);
  return taskExists;
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { company_id, company_name } = req.company;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const projectExists = await isProjectExists(project_id, company_id);
    if (!projectExists) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.project_id, Number(project_id)),
          eq(tasksTable.task_is_deleted, false)
        )
      );

    const tasks = await db
      .select({
        tasks: {
          task_id: tasksTable.task_id,
          task_name: tasksTable.task_name,
          task_description: tasksTable.task_description,
          file_name: tasksTable.file_name,
          audio_data: tasksTable.audio_data,
          task_status: tasksTable.task_status,
          task_created_at: tasksTable.created_at,
          task_updated_at: tasksTable.updated_at,
        },
        users: {
          user_id: usersTable.user_id,
          user_first_name: usersTable.first_name,
          user_last_name: usersTable.last_name,
          user_email: usersTable.email,
          user_role: usersTable.role,
        },
      })
      .from(tasksTable)
      .leftJoin(
        tasksUsersTable,
        eq(tasksTable.task_id, tasksUsersTable.task_id)
      )
      .leftJoin(usersTable, eq(tasksUsersTable.user_id, usersTable.user_id))
      .where(
        and(
          eq(tasksTable.project_id, Number(project_id)),
          eq(tasksTable.task_is_deleted, false)
        )
      )
      .limit(pageSize)
      .offset(offset)
      .then((results) => {
        // Group results by task
        const taskMap = results.reduce((acc, curr) => {
          const taskId = curr.tasks.task_id;

          if (!acc[taskId]) {
            acc[taskId] = {
              ...curr.tasks,
              users: [],
            };
          }
          if (curr.users && curr.users.user_id) {
            acc[taskId].users.push(curr.users);
          }
          return acc;
        }, {});

        // Convert map to array
        return Object.values(taskMap);
      });

    const totalPages = Math.ceil(Number(count) / pageSize);

    res.status(200).json({
      tasks,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: Number(count),
        totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { project_id } = req.params;
    const { userId } = req;
    const { company_id, company_name } = req.company;

    const data = req.cleanBody;

    const projectExists = await isProjectExists(project_id, company_id);
    if (!projectExists) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    data.project_id = Number(project_id);
    data.created_by = userId;
    data.updated_by = userId;

    const [task] = await db.insert(tasksTable).values(data).returning();
    const sanitizedTask = sanitizeData(task, [
      "task_id",
      "project_id",
      "task_name",
      "file_name",
      "audio_data",
      "task_description",
      "task_status",
    ]);

    res.status(201).json(sanitizedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignUsersToTask = async (req: Request, res: Response) => {
  try {
    const { project_id, task_id } = req.params;
    const { userId } = req;
    const { company_id, company_name } = req.company;
    const { user_ids } = req.body;

    const projectExists = await isProjectExists(Number(project_id), company_id);
    if (!projectExists) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    const taskExists = await isTaskExists(Number(task_id), Number(project_id));
    if (!taskExists) {
      return res.status(404).json({
        error: `Task ${task_id} not found for project: ${projectExists.project_name}`,
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
      .from(tasksUsersTable)
      .where(
        and(
          eq(tasksUsersTable.task_id, Number(task_id)),
          inArray(tasksUsersTable.user_id, user_ids.map(Number))
        )
      );

    if (existingAssignments.length > 0) {
      const duplicateUserIds = existingAssignments.map(
        (assignment) => assignment.user_id
      );
      return res.status(400).json({
        error: `Users with IDs: ${duplicateUserIds.join(
          ", "
        )} are already assigned to this task name: ${taskExists.task_name}`,
      });
    }

    // Create new assignments in transaction
    await db.transaction(async (tx) => {
      const assignments = user_ids.map((user_id) => ({
        task_id: Number(task_id),
        user_id: Number(user_id),
      }));

      await tx.insert(tasksUsersTable).values(assignments);
    });

    return res.status(200).json({
      message: `Users successfully assigned to task: ${taskExists.task_name}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unassignUsersFromTask = async (req: Request, res: Response) => {
  const { project_id, task_id } = req.params;
  const { user_ids } = req.body;
  const { company_id, company_name } = req.company;

  try {
    const projectExists = await isProjectExists(Number(project_id), company_id);
    if (!projectExists) {
      return res.status(404).json({
        error: `Project ${project_id} not found for company: ${company_name}`,
      });
    }

    const taskExists = await isTaskExists(Number(task_id), Number(project_id));
    if (!taskExists) {
      return res.status(404).json({
        error: `Task ${task_id} not found for project: ${projectExists.project_name}`,
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
      .from(tasksUsersTable)
      .where(
        and(
          eq(tasksUsersTable.task_id, Number(task_id)),
          inArray(tasksUsersTable.user_id, user_ids.map(Number))
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
        )} are not assigned to this task name: ${taskExists.task_name}`,
      });
    }

    // delete assignments in transaction
    await db.transaction(async (tx) => {
      await tx
        .delete(tasksUsersTable)
        .where(
          and(
            eq(tasksUsersTable.task_id, Number(task_id)),
            inArray(tasksUsersTable.user_id, user_ids.map(Number))
          )
        );
    });

    return res.status(200).json({
      message: `Users successfully unassigned from task: ${taskExists.task_name}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
