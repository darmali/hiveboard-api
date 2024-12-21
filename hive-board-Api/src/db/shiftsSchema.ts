import { boolean, integer, pgEnum, pgTable, timestamp, varchar, time, sql } from "drizzle-orm/pg-core";
import { usersTable } from "./usersSchema";
import { createInsertSchema } from "drizzle-zod";
import { projectsTable } from "./projectsSchema";
import { db } from ".";

export const shiftStatusEnum = pgEnum('shift_status', [
  'active',
  'inactive',
]);

export const shiftsTable = pgTable('shifts', {
  shift_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shift_name: varchar({ length: 255 }).notNull(),
  shift_start_time: time().notNull(),
  shift_end_time: time().notNull(),
  project_id: integer().references(() => projectsTable.project_id),
  shift_status: shiftStatusEnum("shift_status").default("active").notNull(),
  shift_flexibility: boolean().default(false),
  shift_grace_time: integer().default(10), // in minutes
  shift_created_at: timestamp().defaultNow(),
  shift_updated_at: timestamp().defaultNow(),
  shift_is_deleted: boolean().default(false),
  shift_created_by: integer().references(() => usersTable.user_id),
  shift_updated_by: integer().references(() => usersTable.user_id),
});


export const assignmentStatusEnum = pgEnum('assignment_status', [
  'active',
  'inactive',
]);

export const ShiftAssignmentsTable = pgTable("shift_assignments", {
  assignment_id: integer().primaryKey().generatedAlwaysAsIdentity(),
  shift_id: integer().references(() => shiftsTable.shift_id),
  user_id: integer().references(() => usersTable.user_id),
  assignment_status: assignmentStatusEnum("assignment_status").default("active").notNull(),
  assignment_start_time: timestamp().notNull(),
  assignment_end_time: timestamp().notNull(),
  assignment_created_at: timestamp().defaultNow(),
  assignment_updated_at: timestamp().defaultNow(),
  assignment_is_deleted: boolean().default(false),
  assignment_created_by: integer().references(() => usersTable.user_id),
  assignment_updated_by: integer().references(() => usersTable.user_id),
});


export const insertShiftSchema = createInsertSchema(shiftsTable)
  .omit({
    shift_id: true,
    shift_created_at: true,
    shift_updated_at: true,
    shift_is_deleted: true,
    shift_created_by: true,
    shift_updated_by: true,
  })
  .refine(
    async (data) => {
      // Check for overlapping shifts in the same project
      const overlappingShifts = await db
        .select()
        .from(shiftsTable)
        .where(
          sql`
            project_id = ${data.project_id}
            AND shift_status = 'active'
            AND shift_is_deleted = false
            AND (
              (${data.shift_start_time} BETWEEN shift_start_time AND shift_end_time)
              OR
              (${data.shift_end_time} BETWEEN shift_start_time AND shift_end_time)
              OR
              (shift_start_time BETWEEN ${data.shift_start_time} AND ${data.shift_end_time})
            )
          `
        );
      return overlappingShifts.length === 0;
    },
    {
      message: "Shift time overlaps with existing shifts in the project",
    }
  );

export const updateShiftSchema = createInsertSchema(shiftsTable)
  .omit({
    shift_id: true,
    shift_created_at: true,
    shift_updated_at: true,
    shift_is_deleted: true,
    shift_created_by: true,
    shift_updated_by: true,
  })
  .refine(
    async (data) => {
      const overlappingShifts = await db
        .select()
        .from(shiftsTable)
        .where(
          sql`
            project_id = ${data.project_id}
            AND shift_status = 'active'
            AND shift_is_deleted = false
            AND shift_id != ${data.shift_id}
            AND (
              (${data.shift_start_time} BETWEEN shift_start_time AND shift_end_time)
              OR
              (${data.shift_end_time} BETWEEN shift_start_time AND shift_end_time)
              OR
              (shift_start_time BETWEEN ${data.shift_start_time} AND ${data.shift_end_time})
            )
          `
        );
      return overlappingShifts.length === 0;
    },
    {
      message: "Shift time overlaps with existing shifts in the project",
    }
  );   

export const insertShiftAssignmentSchema = createInsertSchema(ShiftAssignmentsTable)
  .omit({
    assignment_id: true,
    assignment_created_at: true,
    assignment_updated_at: true,
    assignment_is_deleted: true,
    assignment_created_by: true,
    assignment_updated_by: true,
  });

  export const updateShiftAssignmentSchema = createInsertSchema(ShiftAssignmentsTable)
  .omit({
    assignment_id: true,
    assignment_created_at: true,
    assignment_updated_at: true,
    assignment_is_deleted: true,
    assignment_created_by: true,
    assignment_updated_by: true,
  });