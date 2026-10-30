CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"onboarded" boolean DEFAULT false NOT NULL,
	"onboarded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
