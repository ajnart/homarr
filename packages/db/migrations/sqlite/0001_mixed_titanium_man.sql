COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = OFF;
--> statement-breakpoint
BEGIN TRANSACTION;
--> statement-breakpoint
ALTER TABLE `user` RENAME TO `__user_old`;
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`password` text,
	`salt` text,
    `homeBoardId` text,
    FOREIGN KEY (`homeBoardId`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `user` SELECT `id`, `name`, `email`, `emailVerified`, `image`, `password`, `salt`, null FROM `__user_old`;
--> statement-breakpoint
DROP TABLE `__user_old`;
--> statement-breakpoint
ALTER TABLE `user` RENAME TO `__user_old`;
--> statement-breakpoint
ALTER TABLE `__user_old` RENAME TO `user`;
--> statement-breakpoint
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys = ON;
--> statement-breakpoint
BEGIN TRANSACTION;