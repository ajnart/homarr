ALTER TABLE `account` RENAME COLUMN `userId` TO `user_id`;--> statement-breakpoint
ALTER TABLE `account` RENAME COLUMN `providerAccountId` TO `provider_account_id`;--> statement-breakpoint
ALTER TABLE `apiKey` RENAME COLUMN `apiKey` TO `api_key`;--> statement-breakpoint
ALTER TABLE `apiKey` RENAME COLUMN `userId` TO `user_id`;--> statement-breakpoint
ALTER TABLE `groupMember` RENAME COLUMN `groupId` TO `group_id`;--> statement-breakpoint
ALTER TABLE `groupMember` RENAME COLUMN `userId` TO `user_id`;--> statement-breakpoint
ALTER TABLE `groupPermission` RENAME COLUMN `groupId` TO `group_id`;--> statement-breakpoint
ALTER TABLE `iconRepository` RENAME COLUMN `iconRepository_id` TO `id`;--> statement-breakpoint
ALTER TABLE `iconRepository` RENAME COLUMN `iconRepository_slug` TO `slug`;--> statement-breakpoint
ALTER TABLE `icon` RENAME COLUMN `icon_id` TO `id`;--> statement-breakpoint
ALTER TABLE `icon` RENAME COLUMN `icon_name` TO `name`;--> statement-breakpoint
ALTER TABLE `icon` RENAME COLUMN `icon_url` TO `url`;--> statement-breakpoint
ALTER TABLE `icon` RENAME COLUMN `icon_checksum` TO `checksum`;--> statement-breakpoint
ALTER TABLE `icon` RENAME COLUMN `iconRepository_id` TO `icon_repository_id`;--> statement-breakpoint
ALTER TABLE `serverSetting` RENAME COLUMN `key` TO `setting_key`;--> statement-breakpoint
ALTER TABLE `session` RENAME COLUMN `sessionToken` TO `session_token`;--> statement-breakpoint
ALTER TABLE `session` RENAME COLUMN `userId` TO `user_id`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `emailVerified` TO `email_verified`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `homeBoardId` TO `home_board_id`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `colorScheme` TO `color_scheme`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `firstDayOfWeek` TO `first_day_of_week`;--> statement-breakpoint
ALTER TABLE `user` RENAME COLUMN `pingIconsEnabled` TO `ping_icons_enabled`;--> statement-breakpoint
ALTER TABLE `serverSetting` DROP INDEX `serverSetting_key_unique`;--> statement-breakpoint
ALTER TABLE `account` DROP FOREIGN KEY `account_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `apiKey` DROP FOREIGN KEY `apiKey_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `groupMember` DROP FOREIGN KEY `groupMember_groupId_group_id_fk`;
--> statement-breakpoint
ALTER TABLE `groupMember` DROP FOREIGN KEY `groupMember_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `groupPermission` DROP FOREIGN KEY `groupPermission_groupId_group_id_fk`;
--> statement-breakpoint
ALTER TABLE `icon` DROP FOREIGN KEY `icon_iconRepository_id_iconRepository_iconRepository_id_fk`;
--> statement-breakpoint
ALTER TABLE `session` DROP FOREIGN KEY `session_userId_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `user` DROP FOREIGN KEY `user_homeBoardId_board_id_fk`;
--> statement-breakpoint
DROP INDEX `userId_idx` ON `account`;--> statement-breakpoint
DROP INDEX `user_id_idx` ON `session`;--> statement-breakpoint
ALTER TABLE `account` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `groupMember` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `iconRepository` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `icon` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `serverSetting` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `session` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `account` ADD PRIMARY KEY(`provider`,`provider_account_id`);--> statement-breakpoint
ALTER TABLE `groupMember` ADD PRIMARY KEY(`group_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `iconRepository` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `icon` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `serverSetting` ADD PRIMARY KEY(`setting_key`);--> statement-breakpoint
ALTER TABLE `session` ADD PRIMARY KEY(`session_token`);--> statement-breakpoint
ALTER TABLE `serverSetting` ADD CONSTRAINT `serverSetting_settingKey_unique` UNIQUE(`setting_key`);--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `apiKey` ADD CONSTRAINT `apiKey_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupMember` ADD CONSTRAINT `groupMember_group_id_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupMember` ADD CONSTRAINT `groupMember_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `groupPermission` ADD CONSTRAINT `groupPermission_group_id_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `icon` ADD CONSTRAINT `icon_icon_repository_id_iconRepository_id_fk` FOREIGN KEY (`icon_repository_id`) REFERENCES `iconRepository`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user` ADD CONSTRAINT `user_home_board_id_board_id_fk` FOREIGN KEY (`home_board_id`) REFERENCES `board`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `session` (`user_id`);