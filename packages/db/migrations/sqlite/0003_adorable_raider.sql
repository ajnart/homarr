CREATE TABLE `serverSetting` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text DEFAULT '{"json": {}}' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `serverSetting_key_unique` ON `serverSetting` (`key`);