CREATE TABLE "interviewComments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"interview_id" varchar(36) NOT NULL,
	"comment_date" bigint NOT NULL,
	"comment" text NOT NULL,
	"pinned" boolean DEFAULT false,
	CONSTRAINT "interviewComments_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "interviewComments" ADD CONSTRAINT "interviewComments_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint