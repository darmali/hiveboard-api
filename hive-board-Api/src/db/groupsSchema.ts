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
    group_company_id: integer().references(() => companiesTable.company_id),
    group_created_at: timestamp().defaultNow(),
    group_updated_at: timestamp().defaultNow(),
    group_created_by: integer().references(() => usersTable.user_id),
    group_updated_by: integer().references(() => usersTable.user_id),
  }, table => ({
    unique_group_name: unique().on(table.group_name, table.group_company_id),
  }));

export const createGroupSchema = createInsertSchema(groupsTable).omit({
  group_id: true,
  group_company_id: true,
  group_created_at: true,
  group_updated_at: true,
  group_created_by: true,
  group_updated_by: true,
  group_is_deleted: true,
});

export const updateGroupSchema = createInsertSchema(groupsTable).omit({
  group_id: true,
  group_company_id: true,
  group_created_at: true,
  group_updated_at: true,
  group_created_by: true,
  group_updated_by: true,
  group_is_deleted: true,
});