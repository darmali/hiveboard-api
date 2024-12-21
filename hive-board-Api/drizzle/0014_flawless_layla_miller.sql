ALTER TABLE "file_info" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "project_files" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "file_info" CASCADE;--> statement-breakpoint
DROP TABLE "project_files" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "company_id" TO "project_company_id";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_project_name_company_id_unique";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_company_id_companies_company_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_project_company_id_companies_company_id_fk" FOREIGN KEY ("project_company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_name_project_company_id_unique" UNIQUE("project_name","project_company_id");--> statement-breakpoint
DROP TYPE "public"."file_info_type";