CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `app` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text NOT NULL,
	`href` text
);
--> statement-breakpoint
CREATE TABLE `boardGroupPermission` (
	`board_id` text NOT NULL,
	`group_id` text NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`board_id`, `group_id`, `permission`),
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `boardUserPermission` (
	`board_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`board_id`, `permission`, `user_id`),
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `board` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`creator_id` text,
	`page_title` text,
	`meta_title` text,
	`logo_image_url` text,
	`favicon_image_url` text,
	`background_image_url` text,
	`background_image_attachment` text DEFAULT 'fixed' NOT NULL,
	`background_image_repeat` text DEFAULT 'no-repeat' NOT NULL,
	`background_image_size` text DEFAULT 'cover' NOT NULL,
	`primary_color` text DEFAULT '#fa5252' NOT NULL,
	`secondary_color` text DEFAULT '#fd7e14' NOT NULL,
	`opacity` integer DEFAULT 100 NOT NULL,
	`custom_css` text,
	`column_count` integer DEFAULT 10 NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `groupMember` (
	`groupId` text NOT NULL,
	`userId` text NOT NULL,
	PRIMARY KEY(`groupId`, `userId`),
	FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groupPermission` (
	`groupId` text NOT NULL,
	`permission` text NOT NULL,
	FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `group` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_id` text,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `iconRepository` (
	`iconRepository_id` text PRIMARY KEY NOT NULL,
	`iconRepository_slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `icon` (
	`icon_id` text PRIMARY KEY NOT NULL,
	`icon_name` text NOT NULL,
	`icon_url` text NOT NULL,
	`icon_checksum` text NOT NULL,
	`iconRepository_id` text NOT NULL,
	FOREIGN KEY (`iconRepository_id`) REFERENCES `iconRepository`(`iconRepository_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integration_item` (
	`item_id` text NOT NULL,
	`integration_id` text NOT NULL,
	PRIMARY KEY(`integration_id`, `item_id`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrationSecret` (
	`kind` text NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL,
	`integration_id` text NOT NULL,
	PRIMARY KEY(`integration_id`, `kind`),
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integration` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invite` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`expiration_date` integer NOT NULL,
	`creator_id` text NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`kind` text NOT NULL,
	`x_offset` integer NOT NULL,
	`y_offset` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`options` text DEFAULT '{"json": {}}' NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `section` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`kind` text NOT NULL,
	`position` integer NOT NULL,
	`name` text,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`password` text,
	`salt` text
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `board_name_unique` ON `board` (`name`);--> statement-breakpoint
CREATE INDEX `integration_secret__kind_idx` ON `integrationSecret` (`kind`);--> statement-breakpoint
CREATE INDEX `integration_secret__updated_at_idx` ON `integrationSecret` (`updated_at`);--> statement-breakpoint
CREATE INDEX `integration__kind_idx` ON `integration` (`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `invite_token_unique` ON `invite` (`token`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `session` (`userId`);