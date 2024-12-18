ALTER TABLE "tasks" ADD COLUMN "task_file_info_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_file_info_id_file_info_file_info_id_fk" FOREIGN KEY ("task_file_info_id") REFERENCES "public"."file_info"("file_info_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
