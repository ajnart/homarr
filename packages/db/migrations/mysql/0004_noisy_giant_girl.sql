CREATE TABLE `integrationGroupPermissions` (
	`integration_id` varchar(64) NOT NULL,
	`group_id` varchar(64) NOT NULL,
	`permission` varchar(128) NOT NULL,
	CONSTRAINT `integration_group_permission__pk` PRIMARY KEY(`integration_id`,`group_id`,`permission`)
);
--> statement-breakpoint
CREATE TABLE `integrationUserPermission` (
	`integration_id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`permission` varchar(128) NOT NULL,
	CONSTRAINT `integrationUserPermission_integration_id_user_id_permission_pk` PRIMARY KEY(`integration_id`,`user_id`,`permission`)
);
--> statement-breakpoint
ALTER TABLE `integrationGroupPermissions` ADD CONSTRAINT `integrationGroupPermissions_integration_id_integration_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrationGroupPermissions` ADD CONSTRAINT `integrationGroupPermissions_group_id_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrationUserPermission` ADD CONSTRAINT `integrationUserPermission_integration_id_integration_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `integrationUserPermission` ADD CONSTRAINT `integrationUserPermission_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;