CREATE TABLE "applications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"job_description" text NOT NULL,
	"application_date" integer NOT NULL,
	"status" varchar(30) NOT NULL,
	CONSTRAINT "applications_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"application_id" varchar(36) NOT NULL,
	"interview_date" integer NOT NULL,
	"topic" text NOT NULL,
	"participants" text NOT NULL,
	"prep_notes" text NOT NULL,
	CONSTRAINT "interviews_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE cascade;