ALTER TABLE "file_info" ALTER COLUMN "file_info_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "file_info" ALTER COLUMN "file_info_data" SET NOT NULL;