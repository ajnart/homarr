CREATE TABLE `media` (
	`id` varchar(64) NOT NULL,
	`name` varchar(512) NOT NULL,
	`content` BLOB NOT NULL,
	`content_type` text NOT NULL,
	`size` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`creator_id` varchar(64),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_creator_id_user_id_fk` FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;