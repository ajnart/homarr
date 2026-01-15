PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`password` text,
	`salt` text,
	`provider` text DEFAULT 'credentials' NOT NULL,
	`homeBoardId` text,
	`colorScheme` text DEFAULT 'dark' NOT NULL,
	`firstDayOfWeek` integer DEFAULT 1 NOT NULL,
	`pingIconsEnabled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`homeBoardId`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "emailVerified", "image", "password", "salt", "provider", "homeBoardId", "colorScheme", "firstDayOfWeek", "pingIconsEnabled") SELECT "id", "name", "email", "emailVerified", "image", "password", "salt", "provider", "homeBoardId", "colorScheme", "firstDayOfWeek", "pingIconsEnabled" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;