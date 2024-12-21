import { boolean, integer, timestamp, varchar, pgEnum, pgTable, customType, primaryKey } from "drizzle-orm/pg-core";
import { projectsTable, projectsUsersTable } from "./projectsSchema";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./usersSchema";
import { and, eq, isNotNull, relations } from "drizzle-orm";
import { db } from ".";
import { fileInfoTable, createFileInfoSchema } from "./projectFilesSchema";
import { z } from "zod";

export const taskStatusEnum = pgEnum("task_status", [
  "ready",
  "active",
  "in_progress",
  "complete",
  "cancelled",
]);

export const tasksTable = pgTable("tasks", {
  task_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_name: varchar({ length: 255 }).notNull(),
  task_project_id: integer().references(() => projectsTable.project_id),
  task_description: varchar({ length: 255 }),
  task_status: taskStatusEnum("task_status").notNull().default("ready"),
  task_file_info_id: integer().references(() => fileInfoTable.file_info_id),
  task_created_at: timestamp().defaultNow(),
  task_updated_at: timestamp().defaultNow(),
  task_created_by: integer().references(() => usersTable.user_id),
  task_updated_by: integer().references(() => usersTable.user_id),
  task_is_deleted: boolean().default(false),
});

const fileInfoSubSchema = createInsertSchema(fileInfoTable)
  .omit({
    file_info_id: true,
    file_info_created_at: true,
    file_info_updated_at: true,
    file_info_created_by: true,
    file_info_updated_by: true,
    file_info_data: true,
    file_info_is_deleted: true,
  });

export const createTaskSchema = createInsertSchema(tasksTable)
  .omit({
    task_id: true,
    task_created_at: true,
    task_updated_at: true,
    task_created_by: true,
    task_updated_by: true,
    task_is_deleted: true,
  });

export const updateTaskSchema = createInsertSchema(tasksTable)
  .omit({
    task_id: true,
    task_created_at: true,
    task_created_by: true,
    task_updated_at: true,
    task_updated_by: true,
    task_is_deleted: true,
  })
  .extend({
    file_info: fileInfoSubSchema.optional(),
  });

export const tasksUsersTable = pgTable("tasks_users", {
  task_id: integer().references(() => tasksTable.task_id),
  user_id: integer().references(() => usersTable.user_id),
}, (table) => ({
    pk: primaryKey({ columns: [table.task_id, table.user_id] }),
  })
);

