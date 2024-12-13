CREATE TYPE "public"."company_size" AS ENUM('1-3', '4-10', '11-49', '50-99', '100+');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'company_admin', 'project_manager', 'project_member');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'pending', 'inactive', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('registered_user', 'invited_user');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('ready', 'active', 'in_progress', 'complete', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'bid', 'important', 'in_progress', 'complete', 'paid');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"company_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "companies_company_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company_name" varchar(255) NOT NULL,
	"company_size" "company_size" NOT NULL,
	CONSTRAINT "companies_company_name_unique" UNIQUE("company_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"phone" varchar(255) NOT NULL,
	"occupation_id" integer,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"user_role" "user_role" DEFAULT 'company_admin' NOT NULL,
	"user_type" "user_type" DEFAULT 'registered_user' NOT NULL,
	"company_id" integer,
	"user_status" "user_status" DEFAULT 'pending' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"task_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tasks_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_name" varchar(255) NOT NULL,
	"project_id" integer,
	"task_description" varchar(255),
	"file_name" varchar(255),
	"audio_data" "bytea",
	"task_status" "task_status" DEFAULT 'ready' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks_users" (
	"task_id" integer,
	"user_id" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "occupations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "occupations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ar_name" varchar(255) NOT NULL,
	"en_name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"project_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_project_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_name" varchar(255) NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"project_description" varchar(255),
	"company_id" integer,
	"project_status" "project_status"[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects_users" (
	"project_id" integer,
	"user_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_occupation_id_occupations_id_fk" FOREIGN KEY ("occupation_id") REFERENCES "public"."occupations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_users" ADD CONSTRAINT "tasks_users_task_id_tasks_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("task_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks_users" ADD CONSTRAINT "tasks_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_users" ADD CONSTRAINT "projects_users_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_users" ADD CONSTRAINT "projects_users_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
