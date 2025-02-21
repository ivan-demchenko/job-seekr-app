CREATE TABLE `applications` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`company` text NOT NULL,
	`position` text NOT NULL,
	`job_description` text NOT NULL,
	`application_date` integer NOT NULL,
	`status` text(30) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_id_unique` ON `applications` (`id`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`application_id` text(36) NOT NULL,
	`interview_date` integer NOT NULL,
	`topic` text NOT NULL,
	`participants` text NOT NULL,
	`prep_notes` text NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interviews_id_unique` ON `interviews` (`id`);