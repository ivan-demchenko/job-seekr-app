CREATE TABLE `applications` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`company` text,
	`position` text,
	`job_description` text,
	`application_date` integer,
	`status` text(30)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_id_unique` ON `applications` (`id`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text(36) PRIMARY KEY NOT NULL,
	`application_id` text(36) NOT NULL,
	`interview_date` integer,
	`topic` text,
	`participants` text,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interviews_id_unique` ON `interviews` (`id`);