ALTER TABLE `iconRepository` RENAME COLUMN "iconRepository_id" TO "id";--> statement-breakpoint
ALTER TABLE `iconRepository` RENAME COLUMN "iconRepository_slug" TO "slug";--> statement-breakpoint
ALTER TABLE `serverSetting` RENAME COLUMN "key" TO "setting_key";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `provider_account_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("user_id", "type", "provider", "provider_account_id", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state") SELECT "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`user_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_apiKey` (
	`id` text PRIMARY KEY NOT NULL,
	`api_key` text NOT NULL,
	`salt` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_apiKey`("id", "api_key", "salt", "user_id") SELECT "id", "apiKey", "salt", "userId" FROM `apiKey`;--> statement-breakpoint
DROP TABLE `apiKey`;--> statement-breakpoint
ALTER TABLE `__new_apiKey` RENAME TO `apiKey`;--> statement-breakpoint
CREATE TABLE `__new_groupMember` (
	`group_id` text NOT NULL,
	`user_id` text NOT NULL,
	PRIMARY KEY(`group_id`, `user_id`),
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_groupMember`("group_id", "user_id") SELECT "groupId", "userId" FROM `groupMember`;--> statement-breakpoint
DROP TABLE `groupMember`;--> statement-breakpoint
ALTER TABLE `__new_groupMember` RENAME TO `groupMember`;--> statement-breakpoint
CREATE TABLE `__new_groupPermission` (
	`group_id` text NOT NULL,
	`permission` text NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_groupPermission`("group_id", "permission") SELECT "groupId", "permission" FROM `groupPermission`;--> statement-breakpoint
DROP TABLE `groupPermission`;--> statement-breakpoint
ALTER TABLE `__new_groupPermission` RENAME TO `groupPermission`;--> statement-breakpoint
CREATE TABLE `__new_icon` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`checksum` text NOT NULL,
	`icon_repository_id` text NOT NULL,
	FOREIGN KEY (`icon_repository_id`) REFERENCES `iconRepository`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_icon`("id", "name", "url", "checksum", "icon_repository_id") SELECT "icon_id", "icon_name", "icon_url", "icon_checksum", "iconRepository_id" FROM `icon`;--> statement-breakpoint
DROP TABLE `icon`;--> statement-breakpoint
ALTER TABLE `__new_icon` RENAME TO `icon`;--> statement-breakpoint
DROP INDEX IF EXISTS `serverSetting_key_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `serverSetting_settingKey_unique` ON `serverSetting` (`setting_key`);--> statement-breakpoint
CREATE TABLE `__new_session` (
	`session_token` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("session_token", "user_id", "expires") SELECT "sessionToken", "userId", "expires" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
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
	`color_scheme` text DEFAULT 'dark' NOT NULL,
	`first_day_of_week` integer DEFAULT 1 NOT NULL,
	`ping_icons_enabled` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`home_board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "email", "email_verified", "image", "password", "salt", "provider", "home_board_id", "color_scheme", "first_day_of_week", "ping_icons_enabled") SELECT "id", "name", "email", "emailVerified", "image", "password", "salt", "provider", "homeBoardId", "colorScheme", "firstDayOfWeek", "pingIconsEnabled" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;