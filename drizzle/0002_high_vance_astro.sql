ALTER TABLE "user_logins" ALTER COLUMN "user_agent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_logins" ALTER COLUMN "last_used" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "type" SET DATA TYPE user_type;--> statement-breakpoint
ALTER TABLE "user_logins" DROP COLUMN IF EXISTS "device_info";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "agree_to_terms";