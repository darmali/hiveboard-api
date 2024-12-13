CREATE TABLE IF NOT EXISTS "users_groups" (
	"user_id" integer,
	"group_id" integer,
	CONSTRAINT "users_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects_groups" (
	"project_id" integer,
	"group_id" integer,
	CONSTRAINT "projects_groups_project_id_group_id_pk" PRIMARY KEY("project_id","group_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"group_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "groups_group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"group_name" varchar(255) NOT NULL,
	"group_description" varchar(255),
	"group_is_deleted" boolean DEFAULT false,
	"company_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	"updated_by" integer,
	CONSTRAINT "groups_group_name_company_id_unique" UNIQUE("group_name","company_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_groups" ADD CONSTRAINT "users_groups_group_id_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_groups" ADD CONSTRAINT "projects_groups_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_groups" ADD CONSTRAINT "projects_groups_group_id_groups_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("group_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_company_id_companies_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("company_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
