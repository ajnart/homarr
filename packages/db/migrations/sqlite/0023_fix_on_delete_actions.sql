-- Custom SQL migration file, put your code below! --
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = OFF;
--> statement-breakpoint
BEGIN TRANSACTION;
--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`email_verified` integer,
	`image` text,
	`password` text,
	`salt` text,
	`provider` text DEFAULT 'credentials' NOT NULL,
	`home_board_id` text,
    `mobile_home_board_id` text,
    `default_search_engine_id` text,
    `open_search_in_new_tab` integer DEFAULT true NOT NULL,
	`color_scheme` text DEFAULT 'dark' NOT NULL,
	`first_day_of_week` integer DEFAULT 1 NOT NULL,
	`ping_icons_enabled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`home_board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (`mobile_home_board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (`default_search_engine_id`) REFERENCES `search_engine`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "password", "salt", "provider", "home_board_id", "mobile_home_board_id", "default_search_engine_id", "open_search_in_new_tab", "color_scheme", "first_day_of_week", "ping_icons_enabled") SELECT "id", "name", "email", "email_verified", "image", "password", "salt", "provider", "home_board_id", "mobile_home_board_id", "default_search_engine_id", "open_search_in_new_tab", "color_scheme", "first_day_of_week", "ping_icons_enabled" FROM `user`;
--> statement-breakpoint
DROP TABLE `user`;
--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;
--> statement-breakpoint
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = ON;
--> statement-breakpoint
BEGIN TRANSACTION;