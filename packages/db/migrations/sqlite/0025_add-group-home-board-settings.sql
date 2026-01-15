COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = OFF;
--> statement-breakpoint
BEGIN TRANSACTION;
--> statement-breakpoint
CREATE TABLE `__new_group` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text,
    `home_board_id` text,
    `mobile_home_board_id` text,
	`position` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`home_board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`mobile_home_board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_group`("id", "name", "owner_id", "position") SELECT "id", "name", "owner_id", -1 FROM `group` WHERE "name" = 'everyone';
--> statement-breakpoint
INSERT INTO `__new_group`("id", "name", "owner_id", "position") SELECT "id", "name", "owner_id", ROW_NUMBER() OVER(ORDER BY "name") FROM `group` WHERE "name" != 'everyone';
--> statement-breakpoint
DROP TABLE `group`;
--> statement-breakpoint
ALTER TABLE `__new_group` RENAME TO `group`;
--> statement-breakpoint
CREATE UNIQUE INDEX `group_name_unique` ON `group` (`name`);
--> statement-breakpoint
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = ON;
--> statement-breakpoint
BEGIN TRANSACTION;