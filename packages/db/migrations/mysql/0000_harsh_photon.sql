CREATE TABLE `account` (
	`userId` varchar(64) NOT NULL,
	`type` text NOT NULL,
	`provider` varchar(64) NOT NULL,
	`providerAccountId` varchar(64) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	CONSTRAINT `account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `app` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon_url` text NOT NULL,
	`href` text,
	CONSTRAINT `app_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `boardGroupPermission` (
	`board_id` varchar(64) NOT NULL,
	`group_id` varchar(64) NOT NULL,
	`permission` varchar(128) NOT NULL,
	CONSTRAINT `boardGroupPermission_board_id_group_id_permission_pk` PRIMARY KEY(`board_id`,`group_id`,`permission`)
);
--> statement-breakpoint
CREATE TABLE `boardUserPermission` (
	`board_id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`permission` varchar(128) NOT NULL,
	CONSTRAINT `boardUserPermission_board_id_user_id_permission_pk` PRIMARY KEY(`board_id`,`user_id`,`permission`)
);
--> statement-breakpoint
CREATE TABLE `board` (
	`id` varchar(64) NOT NULL,
	`name` varchar(256) NOT NULL,
	`is_public` boolean NOT NULL DEFAULT false,
	`creator_id` varchar(64),
	`page_title` text,
	`meta_title` text,
	`logo_image_url` text,
	`favicon_image_url` text,
	`background_image_url` text,
	`background_image_attachment` text NOT NULL DEFAULT ('fixed'),
	`background_image_repeat` text NOT NULL DEFAULT ('no-repeat'),
	`background_image_size` text NOT NULL DEFAULT ('cover'),
	`primary_color` text NOT NULL DEFAULT ('#fa5252'),
	`secondary_color` text NOT NULL DEFAULT ('#fd7e14'),
	`opacity` int NOT NULL DEFAULT 100,
	`custom_css` text,
	`column_count` int NOT NULL DEFAULT 10,
	CONSTRAINT `board_id` PRIMARY KEY(`id`),
	CONSTRAINT `board_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `groupMember` (
	`groupId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	CONSTRAINT `groupMember_groupId_userId_pk` PRIMARY KEY(`groupId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `groupPermission` (
	`groupId` varchar(64) NOT NULL,
	`permission` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `group` (
	`id` varchar(64) NOT NULL,
	`name` varchar(64) NOT NULL,
	`owner_id` varchar(64),
	CONSTRAINT `group_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iconRepository` (
	`iconRepository_id` varchar(64) NOT NULL,
	`iconRepository_slug` varchar(150) NOT NULL,
	CONSTRAINT `iconRepository_iconRepository_id` PRIMARY KEY(`iconRepository_id`)
);
--> statement-breakpoint
CREATE TABLE `icon` (
	`icon_id` varchar(64) NOT NULL,
	`icon_name` varchar(250) NOT NULL,
	`icon_url` text NOT NULL,
	`icon_checksum` text NOT NULL,
	`iconRepository_id` varchar(64) NOT NULL,
	CONSTRAINT `icon_icon_id` PRIMARY KEY(`icon_id`)
);
--> statement-breakpoint
CREATE TABLE `integration_item` (
	`item_id` varchar(64) NOT NULL,
	`integration_id` varchar(64) NOT NULL,
	CONSTRAINT `integration_item_item_id_integration_id_pk` PRIMARY KEY(`item_id`,`integration_id`)
);
--> statement-breakpoint
CREATE TABLE `integrationSecret` (
	`kind` varchar(16) NOT NULL,
	`value` text NOT NULL,
	`updated_at` timestamp NOT NULL,
	`integration_id` varchar(64) NOT NULL,
	CONSTRAINT `integrationSecret_integration_id_kind_pk` PRIMARY KEY(`integration_id`,`kind`)
);
--> statement-breakpoint
CREATE TABLE `integration` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`kind` varchar(128) NOT NULL,
	CONSTRAINT `integration_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invite` (
	`id` varchar(64) NOT NULL,
	`token` varchar(512) NOT NULL,
	`expiration_date` timestamp NOT NULL,
	`creator_id` varchar(64) NOT NULL,
	CONSTRAINT `invite_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` varchar(64) NOT NULL,
	`section_id` varchar(64) NOT NULL,
	`kind` text NOT NULL,
	`x_offset` int NOT NULL,
	`y_offset` int NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	`options` text NOT NULL DEFAULT ('{"json": {}}'),
	CONSTRAINT `item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section` (
	`id` varchar(64) NOT NULL,
	`board_id` varchar(64) NOT NULL,
	`kind` text NOT NULL,
	`position` int NOT NULL,
	`name` text,
	CONSTRAINT `section_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` varchar(512) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(64) NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` timestamp,
	`image` text,
	`password` text,
	`salt` text,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` varchar(64) NOT NULL,
	`token` varchar(512) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verificationToken_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boardGroupPermission` ADD CONSTRAINT `boardGroupPermission_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boardGroupPermission` ADD CONSTRAINT `boardGroupPermission_group_id_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boardUserPermission` ADD CONSTRAINT `boardUserPermission_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `boardUserPermission` ADD CONSTRAINT `boardUserPermission_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `board` ADD CONSTRAINT `board_creator_id_user_id_fk` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupMember` ADD CONSTRAINT `groupMember_groupId_group_id_fk` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupMember` ADD CONSTRAINT `groupMember_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupPermission` ADD CONSTRAINT `groupPermission_groupId_group_id_fk` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group` ADD CONSTRAINT `group_owner_id_user_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `icon` ADD CONSTRAINT `icon_iconRepository_id_iconRepository_iconRepository_id_fk` FOREIGN KEY (`iconRepository_id`) REFERENCES `iconRepository`(`iconRepository_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_item` ADD CONSTRAINT `integration_item_item_id_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integration_item` ADD CONSTRAINT `integration_item_integration_id_integration_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrationSecret` ADD CONSTRAINT `integrationSecret_integration_id_integration_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invite` ADD CONSTRAINT `invite_creator_id_user_id_fk` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `item` ADD CONSTRAINT `item_section_id_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `section` ADD CONSTRAINT `section_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE INDEX `integration_secret__kind_idx` ON `integrationSecret` (`kind`);--> statement-breakpoint
CREATE INDEX `integration_secret__updated_at_idx` ON `integrationSecret` (`updated_at`);--> statement-breakpoint
CREATE INDEX `integration__kind_idx` ON `integration` (`kind`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `session` (`userId`);