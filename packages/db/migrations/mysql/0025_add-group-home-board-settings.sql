ALTER TABLE `group` ADD `home_board_id` varchar(64);
--> statement-breakpoint
ALTER TABLE `group` ADD `mobile_home_board_id` varchar(64);
--> statement-breakpoint
ALTER TABLE `group` ADD `position` smallint;
--> statement-breakpoint
CREATE TABLE `temp_group` (
    `id` varchar(64) NOT NULL,
    `name` varchar(255) NOT NULL,
    `position` smallint NOT NULL
);
--> statement-breakpoint
INSERT INTO `temp_group`(`id`, `name`, `position`) SELECT `id`, `name`, ROW_NUMBER() OVER(ORDER BY `name`) FROM `group` WHERE `name` != 'everyone';
--> statement-breakpoint
UPDATE `group` SET `position`=(SELECT `position` FROM `temp_group` WHERE `temp_group`.`id`=`group`.`id`);
--> statement-breakpoint
DROP TABLE `temp_group`;
--> statement-breakpoint
UPDATE `group` SET `position` = -1 WHERE `name` = 'everyone';
--> statement-breakpoint
ALTER TABLE `group` MODIFY `position` smallint NOT NULL;
--> statement-breakpoint
ALTER TABLE `group` ADD CONSTRAINT `group_home_board_id_board_id_fk` FOREIGN KEY (`home_board_id`) REFERENCES `board`(`id`) ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `group` ADD CONSTRAINT `group_mobile_home_board_id_board_id_fk` FOREIGN KEY (`mobile_home_board_id`) REFERENCES `board`(`id`) ON DELETE set null ON UPDATE no action;