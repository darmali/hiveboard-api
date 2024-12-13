import { pgTable } from "drizzle-orm/pg-core";
import { boolean, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const occupationsTable = pgTable('occupations', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  ar_name: varchar({ length: 255 }).notNull(),
  en_name: varchar({ length: 255 }).notNull(),
  occupation_is_deleted: boolean().default(false)
});

export const createOccupationSchema = createInsertSchema(occupationsTable).omit({
  id: true,
});