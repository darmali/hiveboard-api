import { pgTable, unique } from "drizzle-orm/pg-core";
import { integer, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { companiesTable } from "./companiesSchema";
import { usersTable } from "./usersSchema";
import { createInsertSchema } from "drizzle-zod";

export const groupsTable = pgTable("groups", {
    group_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    group_name: varchar({ length: 255 }).notNull(),
    group_description: varchar({ length: 255 }),
    group_is_deleted: boolean().default(false),
    company_id: integer().references(() => companiesTable.company_id),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
    created_by: integer().references(() => usersTable.user_id),
    updated_by: integer().references(() => usersTable.user_id),
  }, table => ({
    unique_group_name: unique().on(table.group_name, table.company_id),
  }));

export const createGroupSchema = createInsertSchema(groupsTable).omit({
  group_id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
  group_is_deleted: true,
});

export const updateGroupSchema = createInsertSchema(groupsTable).omit({
  group_id: true,
  company_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
  group_is_deleted: true,
});