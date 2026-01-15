CREATE TABLE `section_collapse_state` (
	`user_id` varchar(64) NOT NULL,
	`section_id` varchar(64) NOT NULL,
	`collapsed` boolean NOT NULL DEFAULT false,
	CONSTRAINT `section_collapse_state_user_id_section_id_pk` PRIMARY KEY(`user_id`,`section_id`)
);
--> statement-breakpoint
ALTER TABLE `section_collapse_state` ADD CONSTRAINT `section_collapse_state_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `section_collapse_state` ADD CONSTRAINT `section_collapse_state_section_id_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;