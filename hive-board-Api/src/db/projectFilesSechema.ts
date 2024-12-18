import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
  boolean,
  customType,
  primaryKey,
} from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { projectsTable } from "./projectsSchema";
import { createInsertSchema } from "drizzle-zod";
export const fileInfoTypeEnum = pgEnum('file_info_type', [
  "image",
  "audio",
  "video",
  "document",
  "other",
]);

const bytea = customType({
  dataType: () => {
      return `bytea`;
  },
  toDriver: (value: any) => value, 
  fromDriver: (value: any) => value
});


export const fileInfoTable = pgTable("file_info", {
  file_info_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  file_info_type: fileInfoTypeEnum('file_info_type').notNull().default("audio"),
  file_info_name: varchar({ length: 255 }).notNull(),
  file_info_path: varchar({ length: 255 }), //TODO: add s3 path
  file_info_size: integer(),
  file_info_data: bytea().notNull(),
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
  created_by: integer().references(() => usersTable.user_id),
  updated_by: integer().references(() => usersTable.user_id),
  file_is_deleted: boolean().default(false),
});

export const createFileInfoSchema = createInsertSchema(fileInfoTable).omit({
    file_info_id: true,
    created_at: true,
    updated_at: true,
    created_by: true,
    updated_by: true,
    file_is_deleted: true,
});

export const updateFileInfoSchema = createFileInfoSchema.partial();
export const projectFilesTable = pgTable("project_files", {
  project_id: integer("project_id").references(() => projectsTable.project_id),
  file_info_id: integer("file_info_id").references(() => fileInfoTable.file_info_id),
}, (table) => ({
  pk: primaryKey({ columns: [table.project_id, table.file_info_id] }),
}));

export const createProjectFilesSchema = createInsertSchema(projectFilesTable);
export const updateProjectFilesSchema = createProjectFilesSchema.partial();
