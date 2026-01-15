-- Custom SQL migration file, put your code below! --
ALTER TABLE `item` DROP FOREIGN KEY `item_section_id_section_id_fk`;
--> statement-breakpoint
ALTER TABLE `section` DROP FOREIGN KEY `section_parent_section_id_section_id_fk`;
--> statement-breakpoint
ALTER TABLE `section` MODIFY COLUMN `x_offset` int;
--> statement-breakpoint
ALTER TABLE `section` MODIFY COLUMN `y_offset` int;
--> statement-breakpoint
ALTER TABLE `item` ADD `board_id` varchar(64);
--> statement-breakpoint
ALTER TABLE `item` ADD CONSTRAINT `item_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
UPDATE `item` JOIN `section` ON `item`.`section_id`=`section`.`id` SET `item`.`board_id` = `section`.`board_id`;
--> statement-breakpoint
ALTER TABLE `item` MODIFY COLUMN `board_id` varchar(64) NOT NULL;
--> statement-breakpoint
ALTER TABLE `board` DROP COLUMN `column_count`;
--> statement-breakpoint
ALTER TABLE `item` DROP COLUMN `section_id`;
--> statement-breakpoint
ALTER TABLE `item` DROP COLUMN `x_offset`;
--> statement-breakpoint
ALTER TABLE `item` DROP COLUMN `y_offset`;
--> statement-breakpoint
ALTER TABLE `item` DROP COLUMN `width`;
--> statement-breakpoint
ALTER TABLE `item` DROP COLUMN `height`;
--> statement-breakpoint
ALTER TABLE `section` DROP COLUMN `width`;
--> statement-breakpoint
ALTER TABLE `section` DROP COLUMN `height`;
--> statement-breakpoint
ALTER TABLE `section` DROP COLUMN `parent_section_id`;
--> statement-breakpoint
UPDATE `section` SET `x_offset` = NULL, `y_offset` = NULL WHERE `kind` = 'dynamic';