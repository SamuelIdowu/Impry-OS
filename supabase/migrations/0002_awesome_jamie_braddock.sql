ALTER TABLE "payments" ADD COLUMN "share_token" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_share_token_unique" UNIQUE("share_token");