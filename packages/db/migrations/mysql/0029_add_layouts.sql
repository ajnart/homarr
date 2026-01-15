CREATE TABLE `item_layout` (
	`item_id` varchar(64) NOT NULL,
	`section_id` varchar(64) NOT NULL,
	`layout_id` varchar(64) NOT NULL,
	`x_offset` int NOT NULL,
	`y_offset` int NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	CONSTRAINT `item_layout_item_id_section_id_layout_id_pk` PRIMARY KEY(`item_id`,`section_id`,`layout_id`)
);
--> statement-breakpoint
CREATE TABLE `layout` (
	`id` varchar(64) NOT NULL,
	`name` varchar(32) NOT NULL,
	`board_id` varchar(64) NOT NULL,
	`column_count` tinyint NOT NULL,
	`breakpoint` smallint NOT NULL DEFAULT 0,
	CONSTRAINT `layout_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `section_layout` (
	`section_id` varchar(64) NOT NULL,
	`layout_id` varchar(64) NOT NULL,
	`parent_section_id` varchar(64),
	`x_offset` int NOT NULL,
	`y_offset` int NOT NULL,
	`width` int NOT NULL,
	`height` int NOT NULL,
	CONSTRAINT `section_layout_section_id_layout_id_pk` PRIMARY KEY(`section_id`,`layout_id`)
);
--> statement-breakpoint
ALTER TABLE `item_layout` ADD CONSTRAINT `item_layout_item_id_item_id_fk` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `item_layout` ADD CONSTRAINT `item_layout_section_id_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `item_layout` ADD CONSTRAINT `item_layout_layout_id_layout_id_fk` FOREIGN KEY (`layout_id`) REFERENCES `layout`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `layout` ADD CONSTRAINT `layout_board_id_board_id_fk` FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `section_layout` ADD CONSTRAINT `section_layout_section_id_section_id_fk` FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `section_layout` ADD CONSTRAINT `section_layout_layout_id_layout_id_fk` FOREIGN KEY (`layout_id`) REFERENCES `layout`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `section_layout` ADD CONSTRAINT `section_layout_parent_section_id_section_id_fk` FOREIGN KEY (`parent_section_id`) REFERENCES `section`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO `layout`(`id`, `name`, `board_id`, `column_count`) SELECT `id`, 'Base', `id`, `column_count` FROM `board`;
--> statement-breakpoint
INSERT INTO `item_layout`(`item_id`, `section_id`, `layout_id`, `x_offset`, `y_offset`, `width`, `height`) SELECT `item`.`id`, `section`.`id`, `board`.`id`, `item`.`x_offset`, `item`.`y_offset`, `item`.`width`, `item`.`height` FROM `board` LEFT JOIN `section` ON `section`.`board_id`=`board`.`id` LEFT JOIN `item` ON `item`.`section_id`=`section`.`id` WHERE `item`.`id` IS NOT NULL;
--> statement-breakpoint
INSERT INTO `section_layout`(`section_id`, `layout_id`, `parent_section_id`, `x_offset`, `y_offset`, `width`, `height`) SELECT `section`.`id`, `board`.`id`, `section`.`parent_section_id`, `section`.`x_offset`, `section`.`y_offset`, `section`.`width`, `section`.`height` FROM `board` LEFT JOIN `section` ON `section`.`board_id`=`board`.`id` WHERE `section`.`id` IS NOT NULL AND `section`.`kind` = 'dynamic';
