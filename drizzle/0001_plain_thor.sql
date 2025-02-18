PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_applications` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`job_description` text NOT NULL,
	`application_date` integer NOT NULL,
	`status` text(30) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_applications`("id", "company", "position", "job_description", "application_date", "status") SELECT "id", "company", "position", "job_description", "application_date", "status" FROM `applications`;--> statement-breakpoint
DROP TABLE `applications`;--> statement-breakpoint
ALTER TABLE `__new_applications` RENAME TO `applications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `applications_id_unique` ON `applications` (`id`);--> statement-breakpoint
CREATE TABLE `__new_interviews` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`application_id` text(36) NOT NULL,
	`interview_date` integer NOT NULL,
	`topic` text NOT NULL,
	`participants` text NOT NULL,
	`prep_notes` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_interviews`("id", "application_id", "interview_date", "topic", "participants", "prep_notes") SELECT "id", "application_id", "interview_date", "topic", "participants", "prep_notes" FROM `interviews`;--> statement-breakpoint
DROP TABLE `interviews`;--> statement-breakpoint
ALTER TABLE `__new_interviews` RENAME TO `interviews`;--> statement-breakpoint
CREATE UNIQUE INDEX `interviews_id_unique` ON `interviews` (`id`);