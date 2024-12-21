import { pgTable } from "drizzle-orm/pg-core";
import { boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const occupationsTable = pgTable('occupations', {
  occupation_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  occupation_ar_name: varchar({ length: 255 }).notNull(),
  occupation_en_name: varchar({ length: 255 }).notNull(),
  occupation_is_deleted: boolean().default(false)
});

export const createOccupationSchema = createInsertSchema(occupationsTable).omit({
  occupation_id: true,
  occupation_is_deleted: true,
});

export const selectOccupationSchema = createSelectSchema(occupationsTable).omit({
  occupation_is_deleted: true,
});