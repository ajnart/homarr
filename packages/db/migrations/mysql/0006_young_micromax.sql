ALTER TABLE `section` RENAME COLUMN `position` TO `y_offset`;--> statement-breakpoint
ALTER TABLE `section` ADD `x_offset` int NOT NULL;--> statement-breakpoint
ALTER TABLE `section` ADD `width` int;--> statement-breakpoint
ALTER TABLE `section` ADD `height` int;--> statement-breakpoint
ALTER TABLE `section` ADD `parent_section_id` varchar(64);--> statement-breakpoint
ALTER TABLE `section` ADD CONSTRAINT `section_parent_section_id_section_id_fk` FOREIGN KEY (`parent_section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;