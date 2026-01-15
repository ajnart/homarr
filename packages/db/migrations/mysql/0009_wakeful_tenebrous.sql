CREATE TABLE `apiKey` (
	`id` varchar(64) NOT NULL,
	`apiKey` text NOT NULL,
	`salt` text NOT NULL,
	`userId` varchar(64) NOT NULL,
	CONSTRAINT `apiKey_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `apiKey` ADD CONSTRAINT `apiKey_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;