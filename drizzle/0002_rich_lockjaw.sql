DROP TABLE "note_collaborators" CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "share_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "share_password_hash" text;--> statement-breakpoint
DROP TYPE "public"."collaborator_role";