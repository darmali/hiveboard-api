import { db } from "../db/index.js";
import { tasksUsersTable } from "../db/tasksSchema.js";
import { projectsTable } from "../db/projectsSchema.js";
import { tasksTable } from "../db/tasksSchema.js";
import { usersTable } from "../db/usersSchema.js";
import { sanitizeData } from "../utils/dbHelper.js";
import { AppError } from "../utils/errors.js";
import { inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { eq, and } from "drizzle-orm";

// services/taskService.ts
export class TaskService {
  private async validateProject(project_id: number, company_id: number) {
    const projectExists = await this.isProjectExists(project_id, company_id);
    if (!projectExists) {
      throw new Error(`Project ${project_id} not found`);
    }
    return projectExists;
  }

  private async validateTask(task_id: number, project_id: number) {
    const taskExists = await this.isTaskExists(task_id, project_id);
    if (!taskExists) {
      throw new Error(`Task ${task_id} not found`);
    }
    return taskExists;
  }

  private async validateUsers(user_ids: number[], company_id: number) {
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
      throw new Error(`Users with IDs: ${missingUserIds.join(", ")} not found`);
    }
    return users;
  }

  private async isProjectExists(project_id: number, company_id: number) {
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
  }

  private async isTaskExists(task_id: number, project_id: number) {
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
  }

  async getTasks(
    project_id: number,
    company_id: number,
    page: number,
    pageSize: number
  ) {
    const offset = (page - 1) * pageSize;
    const projectExists = await this.validateProject(project_id, company_id);

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

    return {
      tasks,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: Number(count),
        totalPages: totalPages,
      },
    };
  }

  async assignUsersToTask(
    project_id: number,
    task_id: number,
    user_ids: number[],
    company_id: number,
    company_name: string
  ) {
    try {
      const projectExists = await this.isProjectExists(
        Number(project_id),
        company_id
      );
      if (!projectExists) {
        throw new AppError(
          `Project ${project_id} not found for company: ${company_name}`,
          404
        );
      }

      const taskExists = await this.isTaskExists(
        Number(task_id),
        Number(project_id)
      );
      if (!taskExists) {
        throw new AppError(
          `Task ${task_id} not found for project: ${projectExists.project_name}`,
          404
        );
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
        throw new AppError(
          `Users with IDs: ${missingUserIds.join(
            ", "
          )} not found in company: ${company_name}`,
          400
        );
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
        throw new AppError(
          `Users with IDs: ${duplicateUserIds.join(
            ", "
          )} are already assigned to this task name: ${taskExists.task_name}`,
          400
        );
      }

      // Create new assignments in transaction
      await db.transaction(async (tx) => {
        const assignments = user_ids.map((user_id) => ({
          task_id: Number(task_id),
          user_id: Number(user_id),
        }));

        await tx.insert(tasksUsersTable).values(assignments);
      });

      return taskExists.task_name;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  async unassignUsersFromTask(
    project_id: number,
    task_id: number,
    user_ids: number[],
    company_id: number,
    company_name: string
  ) {
    try {
      const projectExists = await this.isProjectExists(
        Number(project_id),
        company_id
      );
      if (!projectExists) {
        throw new AppError(
          `Project ${project_id} not found for company: ${company_name}`,
          404
        );
      }

      const taskExists = await this.isTaskExists(
        Number(task_id),
        Number(project_id)
      );
      if (!taskExists) {
        throw new AppError(
          `Task ${task_id} not found for project: ${projectExists.project_name}`,
          404
        );
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
        throw new AppError(
          `Users with IDs: ${missingUserIds.join(
            ", "
          )} not found in company: ${company_name}`,
          404
        );
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
        throw new AppError(
          `Users with IDs: ${missingUserIds.join(
            ", "
          )} are not assigned to this task name: ${taskExists.task_name}`,
          400
        );
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

      return taskExists.task_name;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  async createTask(
    project_id: number,
    company_id: number,
    data: any,
    userId: number,
    company_name: string
  ) {
    try {
      data.project_id = Number(project_id);
      data.created_by = userId;
      data.updated_by = userId;

      const projectExists = await this.validateProject(project_id, company_id);

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
      return sanitizedTask;
    } catch (error) {
      console.log(error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }
  async getTask(
    task_id: number,
    project_id: number,
    company_id: number,
    company_name: string
  ) {
    try {
      const taskExists = await this.isTaskExists(task_id, project_id);
      if (!taskExists) {
        throw new AppError(
          `Task ${task_id} not found for project: ${project_id}`,
          404
        );
      }
      const [tasks] = await db
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
            eq(tasksTable.task_id, Number(task_id)),
            eq(tasksTable.task_is_deleted, false)
          )
        )
        .limit(1)
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

      return tasks;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  async deleteTask(task_id: number, project_id: number, company_id: number, company_name: string, userId: number) {
    try {
      const taskExists = await this.isTaskExists(task_id, project_id);
      if (!taskExists) {
        throw new AppError(`Task ${task_id} not found for project: ${company_name}`, 404);
    }
      const [task] = await db.update(tasksTable).set({task_is_deleted: true, updated_by: userId, updated_at: new Date()}).where(eq(tasksTable.task_id, Number(task_id))).returning();
      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  } 

  async updateTask(task_id: number, project_id: number, company_id: number, company_name: string, data: any, userId: number) {
    try {
      const taskExists = await this.isTaskExists(task_id, project_id);
      if (!taskExists) {
        throw new AppError(`Task ${task_id} not found for project: ${project_id}`, 404);
      }
      const [task] = await db.update(tasksTable).set({...data, updated_by: userId, updated_at: new Date()}).where(eq(tasksTable.task_id, Number(task_id))).returning();
      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }
}