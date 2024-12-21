import { integer, pgEnum, varchar, date, timestamp, boolean } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";
import { shiftsTable } from "./shiftsSchema";
import { usersTable } from "./usersSchema";
import { AttendancesTable } from "./attendancesSchema";
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

export const ExceptionsTable = pgTable("exceptions", {
  exception_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  exception_type: exceptionTypeEnum("exception_type").notNull(),
  exception_attendance_id: integer().references(() => AttendancesTable.attendance_id).notNull(),
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

export const exceptionsRelations = relations(ExceptionsTable, ({ one }) => ({
  attendance: one(AttendancesTable, {
    fields: [ExceptionsTable.exception_attendance_id],
    references: [AttendancesTable.attendance_id],
  }),
  user: one(usersTable, {
    fields: [ExceptionsTable.exception_user_id],
    references: [usersTable.user_id],
  }),
  createdBy: one(usersTable, {
    fields: [ExceptionsTable.exception_created_by],
    references: [usersTable.user_id],
  }),
  updatedBy: one(usersTable, {
    fields: [ExceptionsTable.exception_updated_by],
    references: [usersTable.user_id],
  }),
  shift: one(shiftsTable, {
    fields: [ExceptionsTable.exception_shift_id],
    references: [shiftsTable.shift_id],
  }),
}));

export const insertExceptionsSchema = createInsertSchema(ExceptionsTable).omit({
  exception_id: true,
  exception_created_by: true,
  exception_updated_by: true,
  exception_created_at: true,
  exception_updated_at: true,
  exception_is_deleted: true,
});

export const selectExceptionsSchema = createSelectSchema(ExceptionsTable).omit({
  exception_created_by: true,
  exception_updated_by: true,
  exception_created_at: true,
  exception_updated_at: true,
  exception_is_deleted: true,
});
