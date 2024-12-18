CREATE TYPE "public"."file_info_type" AS ENUM('image', 'audio', 'video', 'document', 'other');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_info" (
	"file_info_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "file_info_file_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"file_info_type" "file_info_type" DEFAULT 'audio' NOT NULL,
	"file_info_name" varchar(255) NOT NULL,
	"file_info_path" varchar(255),
	"file_info_size" integer,
	"file_info_data" "bytea",
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	"updated_by" integer,
	"file_is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_files" (
	"project_id" integer,
	"file_info_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_info" ADD CONSTRAINT "file_info_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "file_info" ADD CONSTRAINT "file_info_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_files" ADD CONSTRAINT "project_files_file_info_id_file_info_file_info_id_fk" FOREIGN KEY ("file_info_id") REFERENCES "public"."file_info"("file_info_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "file_name";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "audio_data";