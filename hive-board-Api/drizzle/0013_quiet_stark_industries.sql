CREATE TYPE "public"."attendance_status" AS ENUM('validated', 'invalidated', 'absent', 'late', 'early_departure', 'on_leave', 'auto_resolved');--> statement-breakpoint
CREATE TYPE "public"."exception_type" AS ENUM('late', 'early_departure', 'on_leave', 'auto_resolved', 'full_day_adjustment', 'check_in_adjustment', 'check_out_adjustment');--> statement-breakpoint
CREATE TYPE "public"."assignment_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."shift_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendances" (
	"attendance_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attendances_attendance_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"attendance_user_id" integer,
	"attendance_shift_id" integer,
	"attendance_status" "attendance_status" DEFAULT 'validated' NOT NULL,
	"attendance_check_in_time" timestamp NOT NULL,
	"attendance_check_out_time" timestamp NOT NULL,
	"attendance_check_in_latitude" double precision NOT NULL,
	"attendance_check_in_longitude" double precision NOT NULL,
	"attendance_check_out_latitude" double precision NOT NULL,
	"attendance_check_out_longitude" double precision NOT NULL,
	"attendance_created_at" timestamp DEFAULT now(),
	"attendance_updated_at" timestamp DEFAULT now(),
	"attendance_created_by" integer,
	"attendance_updated_by" integer,
	"attendance_is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exceptions" (
	"exception_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exceptions_exception_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"exception_type" "exception_type" NOT NULL,
	"exception_attendance_id" integer NOT NULL,
	"exception_date" date NOT NULL,
	"exception_details" varchar(255) NOT NULL,
	"exception_user_id" integer NOT NULL,
	"exception_shift_id" integer,
	"exception_created_by" integer NOT NULL,
	"exception_updated_by" integer NOT NULL,
	"exception_created_at" timestamp NOT NULL,
	"exception_updated_at" timestamp NOT NULL,
	"exception_is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shift_assignments" (
	"assignment_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shift_assignments_assignment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"shift_id" integer,
	"user_id" integer,
	"assignment_status" "assignment_status" DEFAULT 'active' NOT NULL,
	"assignment_start_time" timestamp NOT NULL,
	"assignment_end_time" timestamp NOT NULL,
	"assignment_created_at" timestamp DEFAULT now(),
	"assignment_updated_at" timestamp DEFAULT now(),
	"assignment_is_deleted" boolean DEFAULT false,
	"assignment_created_by" integer,
	"assignment_updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shifts" (
	"shift_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shifts_shift_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"shift_name" varchar(255) NOT NULL,
	"shift_start_time" time NOT NULL,
	"shift_end_time" time NOT NULL,
	"project_id" integer,
	"shift_status" "shift_status" DEFAULT 'active' NOT NULL,
	"shift_flexibility" boolean DEFAULT false,
	"shift_grace_time" integer DEFAULT 10,
	"shift_created_at" timestamp DEFAULT now(),
	"shift_updated_at" timestamp DEFAULT now(),
	"shift_is_deleted" boolean DEFAULT false,
	"shift_created_by" integer,
	"shift_updated_by" integer
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "first_name" TO "user_first_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "last_name" TO "user_last_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "phone" TO "user_phone";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "occupation_id" TO "user_occupation_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "email" TO "user_email";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "password" TO "user_password";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "company_id" TO "user_company_id";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "project_id" TO "task_project_id";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "created_at" TO "task_created_at";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "updated_at" TO "task_updated_at";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "created_by" TO "task_created_by";--> statement-breakpoint
ALTER TABLE "tasks" RENAME COLUMN "updated_by" TO "task_updated_by";--> statement-breakpoint
ALTER TABLE "occupations" RENAME COLUMN "id" TO "occupation_id";--> statement-breakpoint
ALTER TABLE "occupations" RENAME COLUMN "ar_name" TO "occupation_ar_name";--> statement-breakpoint
ALTER TABLE "occupations" RENAME COLUMN "en_name" TO "occupation_en_name";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "latitude" TO "project_latitude";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "longitude" TO "project_longitude";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "created_at" TO "project_created_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "updated_at" TO "project_updated_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "created_by" TO "project_created_by";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "updated_by" TO "project_updated_by";--> statement-breakpoint
ALTER TABLE "groups" RENAME COLUMN "company_id" TO "group_company_id";--> statement-breakpoint
ALTER TABLE "groups" RENAME COLUMN "created_at" TO "group_created_at";--> statement-breakpoint
ALTER TABLE "groups" RENAME COLUMN "updated_at" TO "group_updated_at";--> statement-breakpoint
ALTER TABLE "groups" RENAME COLUMN "created_by" TO "group_created_by";--> statement-breakpoint
ALTER TABLE "groups" RENAME COLUMN "updated_by" TO "group_updated_by";--> statement-breakpoint
ALTER TABLE "file_info" RENAME COLUMN "created_at" TO "file_info_created_at";--> statement-breakpoint
ALTER TABLE "file_info" RENAME COLUMN "updated_at" TO "file_info_updated_at";--> statement-breakpoint
ALTER TABLE "file_info" RENAME COLUMN "created_by" TO "file_info_created_by";--> statement-breakpoint
ALTER TABLE "file_info" RENAME COLUMN "updated_by" TO "file_info_updated_by";--> statement-breakpoint
ALTER TABLE "file_info" RENAME COLUMN "file_is_deleted" TO "file_info_is_deleted";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_group_name_company_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_occupation_id_occupations_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_company_id_companies_company_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_project_id_projects_project_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_updated_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_updated_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_company_id_companies_company_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "groups" DROP CONSTRAINT "groups_updated_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "file_info" DROP CONSTRAINT "file_info_created_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "file_info" DROP CONSTRAINT "file_info_updated_by_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_radius" integer DEFAULT 100;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendance_user_id_users_user_id_fk" FOREIGN KEY ("attendance_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendance_shift_id_shifts_shift_id_fk" FOREIGN KEY ("attendance_shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendance_created_by_users_user_id_fk" FOREIGN KEY ("attendance_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_attendance_updated_by_users_user_id_fk" FOREIGN KEY ("attendance_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_exception_attendance_id_attendances_attendance_id_fk" FOREIGN KEY ("exception_attendance_id") REFERENCES "public"."attendances"("attendance_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_exception_user_id_users_user_id_fk" FOREIGN KEY ("exception_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_exception_shift_id_shifts_shift_id_fk" FOREIGN KEY ("exception_shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_exception_created_by_users_user_id_fk" FOREIGN KEY ("exception_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exceptions" ADD CONSTRAINT "exceptions_exception_updated_by_users_user_id_fk" FOREIGN KEY ("exception_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_shifts_shift_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("shift_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_assignment_created_by_users_user_id_fk" FOREIGN KEY ("assignment_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_assignment_updated_by_users_user_id_fk" FOREIGN KEY ("assignment_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shifts" ADD CONSTRAINT "shifts_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shifts" ADD CONSTRAINT "shifts_shift_created_by_users_user_id_fk" FOREIGN KEY ("shift_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shifts" ADD CONSTRAINT "shifts_shift_updated_by_users_user_id_fk" FOREIGN KEY ("shift_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_user_occupation_id_occupations_occupation_id_fk" FOREIGN KEY ("user_occupation_id") REFERENCES "public"."occupations"("occupation_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_user_company_id_companies_company_id_fk" FOREIGN KEY ("user_company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_project_id_projects_project_id_fk" FOREIGN KEY ("task_project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_created_by_users_user_id_fk" FOREIGN KEY ("task_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_updated_by_users_user_id_fk" FOREIGN KEY ("task_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_project_created_by_users_user_id_fk" FOREIGN KEY ("project_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_project_updated_by_users_user_id_fk" FOREIGN KEY ("project_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_group_company_id_companies_company_id_fk" FOREIGN KEY ("group_company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_group_created_by_users_user_id_fk" FOREIGN KEY ("group_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_group_updated_by_users_user_id_fk" FOREIGN KEY ("group_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_info" ADD CONSTRAINT "file_info_file_info_created_by_users_user_id_fk" FOREIGN KEY ("file_info_created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_info" ADD CONSTRAINT "file_info_file_info_updated_by_users_user_id_fk" FOREIGN KEY ("file_info_updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_email_unique" UNIQUE("user_email");--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_group_name_group_company_id_unique" UNIQUE("group_name","group_company_id");