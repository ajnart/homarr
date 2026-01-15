CREATE TABLE `section_collapse_state` (
	`user_id` text NOT NULL,
	`section_id` text NOT NULL,
	`collapsed` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`user_id`, `section_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade
);
