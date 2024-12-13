import {
  doublePrecision,
  integer,
  varchar,
  timestamp,
  unique,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { companiesTable } from "./companiesSchema";
import { usersTable } from "./usersSchema";
import { createInsertSchema } from "drizzle-zod";
import { pgEnum } from "drizzle-orm/pg-core";
import { groupsTable } from "./groupsSchema";

// First, define the enum type
export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "bid",
  "important",
  "in_progress",
  "complete",
  "paid",
]);

export const projectsTable = pgTable(
  "projects",
  {
    project_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    project_name: varchar({ length: 255 }).notNull(),
    latitude: doublePrecision(),
    longitude: doublePrecision(),
    project_description: varchar({ length: 255 }),
    company_id: integer().references(() => companiesTable.company_id),
    project_status: projectStatusEnum("project_status").array(),
    created_at: timestamp().defaultNow(),
    updated_at: timestamp().defaultNow(),
    created_by: integer().references(() => usersTable.user_id),
    updated_by: integer().references(() => usersTable.user_id),
    project_is_deleted: boolean().default(false),
  },
  (table) => {
    return {
      projectNameCompanyUnique: unique().on(
        table.project_name,
        table.company_id
      ),
    };
  }
);

export const projectsUsersTable = pgTable(
  "projects_users",
  {
    project_id: integer().references(() => projectsTable.project_id),
    user_id: integer().references(() => usersTable.user_id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.project_id, table.user_id] }),
    };
  }
);
export const projectsGroupsTable = pgTable("projects_groups", {
  project_id: integer().references(() => projectsTable.project_id),
  group_id: integer().references(() => groupsTable.group_id),
}, table => ({
  pk: primaryKey({ columns: [table.project_id, table.group_id] }),
}));
export const createProjectSchema = createInsertSchema(projectsTable).omit({
  project_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
  company_id: true,
  project_is_deleted: true,
});

export const updateProjectSchema = createInsertSchema(projectsTable).omit({
  project_id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
  company_id: true,
  project_is_deleted: true,
});
