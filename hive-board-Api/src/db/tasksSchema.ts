import { boolean, integer, timestamp, varchar, pgEnum, pgTable, customType } from "drizzle-orm/pg-core";
import { projectsTable, projectsUsersTable } from "./projectsSchema";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./usersSchema";
import { and, eq, isNotNull, relations } from "drizzle-orm";
import { db } from ".";

export const taskStatusEnum = pgEnum("task_status", [
  "ready",
  "active",
  "in_progress",
  "complete",
  "cancelled",
]);
const bytea = customType({
    dataType: () => {
        return `bytea`;
    },
    toDriver: (value) => value, // Pass the binary data as-is to the database
    fromDriver: (value) => value, // Receive the binary data as-is from the database
});

export const tasksTable = pgTable("tasks", {
  task_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  task_name: varchar({ length: 255 }).notNull(),
  project_id: integer().references(() => projectsTable.project_id),
  task_description: varchar({ length: 255 }),
  file_name: varchar({ length: 255 }),
  audio_data: bytea(),
  task_status: taskStatusEnum("task_status").notNull().default("ready"),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
  created_by: integer().references(() => usersTable.user_id),
  updated_by: integer().references(() => usersTable.user_id),
  task_is_deleted: boolean().default(false),
});

export const createTaskSchema = createInsertSchema(tasksTable).omit({
  task_id: true,
});

export const tasksUsersTable = pgTable("tasks_users", {
  task_id: integer().references(() => tasksTable.task_id),
  user_id: integer().references(() => usersTable.user_id),
});

async function validateTaskAssignment(projectId: number, assigneeId: number) {
  const projectUser = await db
    .select()
    .from(projectsUsersTable)
    .where(
      and(
        eq(projectsUsersTable.project_id, projectId),
        eq(projectsUsersTable.user_id, assigneeId)
      )
    );

  if (!projectUser) {
    throw new Error(
      "User must be a member of the project to be assigned tasks"
    );
  }
}
