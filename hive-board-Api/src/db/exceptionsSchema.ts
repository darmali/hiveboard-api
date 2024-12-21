import { integer, pgEnum, varchar, date, timestamp, boolean } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";
import { shiftsTable } from "./shiftsSchema";
import { usersTable } from "./usersSchema";
import { attendancesTable } from "./attendancesSchema";
import { relations } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { createInsertSchema } from "drizzle-zod";

export const exceptionTypeEnum = pgEnum('exception_type', [
  'late',
  'early_departure',
  'on_leave',
  'auto_resolved',
  'full_day_adjustment',
  'check_in_adjustment',
  'check_out_adjustment',
]);

export const exceptionsTable = pgTable("exceptions", {
  exception_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  exception_type: exceptionTypeEnum("exception_type").notNull(),
  exception_attendance_id: integer().references(() => attendancesTable.attendance_id).notNull(),
  exception_date: date().notNull(),
  exception_details: varchar({ length: 255 }).notNull(),
  exception_user_id: integer().references(() => usersTable.user_id).notNull(),
  exception_shift_id: integer().references(() => shiftsTable.shift_id),
  exception_created_by: integer().references(() => usersTable.user_id).notNull(),
  exception_updated_by: integer().references(() => usersTable.user_id).notNull(),
  exception_created_at: timestamp().notNull(),
  exception_updated_at: timestamp().notNull(),
  exception_is_deleted: boolean().default(false),
}); 

export const exceptionsRelations = relations(exceptionsTable, ({ one }) => ({
  attendance: one(attendancesTable, {
    fields: [exceptionsTable.exception_attendance_id],
    references: [attendancesTable.attendance_id],
  }),
  user: one(usersTable, {
    fields: [exceptionsTable.exception_user_id],
    references: [usersTable.user_id],
  }),
  createdBy: one(usersTable, {
    fields: [exceptionsTable.exception_created_by],
    references: [usersTable.user_id],
  }),
  updatedBy: one(usersTable, {
    fields: [exceptionsTable.exception_updated_by],
    references: [usersTable.user_id],
  }),
  shift: one(shiftsTable, {
    fields: [exceptionsTable.exception_shift_id],
    references: [shiftsTable.shift_id],
  }),
}));

export const insertExceptionsSchema = createInsertSchema(exceptionsTable).omit({
  exception_id: true,
  exception_created_by: true,
  exception_updated_by: true,
  exception_created_at: true,
  exception_updated_at: true,
  exception_is_deleted: true,
});

export const selectExceptionsSchema = createSelectSchema(exceptionsTable).omit({
  exception_created_by: true,
  exception_updated_by: true,
  exception_created_at: true,
  exception_updated_at: true,
  exception_is_deleted: true,
});
