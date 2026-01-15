CREATE TABLE `integrationGroupPermissions` (
	`integration_id` text NOT NULL,
	`group_id` text NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`group_id`, `integration_id`, `permission`),
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integrationUserPermission` (
	`integration_id` text NOT NULL,
	`user_id` text NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`integration_id`, `permission`, `user_id`),
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
