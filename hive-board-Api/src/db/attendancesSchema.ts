import { createInsertSchema } from "drizzle-zod";
import { pgTable, integer, timestamp, boolean, pgEnum, varchar, doublePrecision } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { shiftsTable } from "./shiftsSchema";

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'validated',
  'invalidated',
  'absent',
  'late',
  'early_departure',
  'on_leave',
  'auto_resolved',
]);

export const AttendancesTable = pgTable("attendances", {
  attendance_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  attendance_user_id: integer().references(() => usersTable.user_id),
  attendance_shift_id: integer().references(() => shiftsTable.shift_id),
  attendance_status: attendanceStatusEnum("attendance_status").default("validated").notNull(),
  attendance_check_in_time: timestamp().notNull(),
  attendance_check_out_time: timestamp().notNull(),
  attendance_check_in_latitude: doublePrecision().notNull(),
  attendance_check_in_longitude: doublePrecision().notNull(),
  attendance_check_out_latitude: doublePrecision().notNull(),
  attendance_check_out_longitude: doublePrecision().notNull(),
  attendance_created_at: timestamp().defaultNow(),
  attendance_updated_at: timestamp().defaultNow(),
  attendance_created_by: integer().references(() => usersTable.user_id),
  attendance_updated_by: integer().references(() => usersTable.user_id),
  attendance_is_deleted: boolean().default(false),
});

export const insertAttendanceSchema = createInsertSchema(AttendancesTable)
  .omit({
    attendance_id: true,
    attendance_created_at: true,
    attendance_updated_at: true,
    attendance_is_deleted: true,
    attendance_created_by: true,
    attendance_updated_by: true,
  });