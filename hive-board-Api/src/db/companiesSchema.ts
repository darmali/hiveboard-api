import { boolean, integer, varchar, pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const companySizeEnum = pgEnum('company_size', [
  '1-3',
  '4-10',
  '11-49',
  '50-99',
  '100+'
]);

export const companiesTable = pgTable('companies', {
  company_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  company_name: varchar({ length: 255 }).notNull().unique(),
  company_size: companySizeEnum('company_size').notNull(),
  company_is_deleted: boolean().default(false),
});

export const createCompanySchema = createInsertSchema(companiesTable).omit({
  company_id: true,
  company_is_deleted: true,
});