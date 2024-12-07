CREATE TABLE `migrate_token` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`boards` integer NOT NULL,
	`users` integer NOT NULL,
	`integrations` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `migrate_token_token_unique` ON `migrate_token` (`token`);