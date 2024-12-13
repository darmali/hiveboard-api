ALTER TABLE "companies" ADD COLUMN "company_is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "task_is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "occupations" ADD COLUMN "occupation_is_deleted" boolean DEFAULT false;