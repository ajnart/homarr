COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = OFF;
--> statement-breakpoint
BEGIN TRANSACTION;
--> statement-breakpoint
ALTER TABLE `section` RENAME TO `__section_old`;
--> statement-breakpoint
CREATE TABLE `section` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`kind` text NOT NULL,
	`x_offset` integer NOT NULL,
	`y_offset` integer NOT NULL,
	`width` integer,
	`height` integer,
	`name` text,
    `parent_section_id` text,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
	FOREIGN KEY (`parent_section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `section` SELECT `id`, `board_id`, `kind`, 0, `position`, null, null, `name`, null FROM `__section_old`;
--> statement-breakpoint
DROP TABLE `__section_old`;
--> statement-breakpoint
ALTER TABLE `section` RENAME TO `__section_old`;
--> statement-breakpoint
ALTER TABLE `__section_old` RENAME TO `section`;
--> statement-breakpoint
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = ON;
--> statement-breakpoint
BEGIN TRANSACTION;
