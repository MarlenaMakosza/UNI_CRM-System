ALTER TABLE "activities" ALTER COLUMN "lead_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "lead_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "contracts" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "assigned_to" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "assigned_to" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "visits" ALTER COLUMN "lead_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "visits" ALTER COLUMN "user_id" SET DATA TYPE integer;