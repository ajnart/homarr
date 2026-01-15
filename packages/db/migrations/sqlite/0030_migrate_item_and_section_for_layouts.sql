-- Custom SQL migration file, put your code below! --
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
BEGIN TRANSACTION;
--> statement-breakpoint
CREATE TABLE `__new_item` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`kind` text NOT NULL,
	`options` text DEFAULT '{"json": {}}' NOT NULL,
	`advanced_options` text DEFAULT '{"json": {}}' NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_item`("id", "board_id", "kind", "options", "advanced_options") SELECT "item"."id", "section"."board_id", "item"."kind", "item"."options", "item"."advanced_options" FROM `item` LEFT JOIN `section` ON section.id=item.section_id;
--> statement-breakpoint
DROP TABLE `item`;
--> statement-breakpoint
ALTER TABLE `__new_item` RENAME TO `item`;
--> statement-breakpoint
CREATE TABLE `__new_section` (
	`id` text PRIMARY KEY NOT NULL,
	`board_id` text NOT NULL,
	`kind` text NOT NULL,
	`x_offset` integer,
	`y_offset` integer,
	`name` text,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_section`("id", "board_id", "kind", "x_offset", "y_offset", "name") SELECT "id", "board_id", "kind", "x_offset", "y_offset", "name" FROM `section`;
--> statement-breakpoint
DROP TABLE `section`;
--> statement-breakpoint
ALTER TABLE `__new_section` RENAME TO `section`;
--> statement-breakpoint
UPDATE `section` SET `x_offset` = NULL, `y_offset` = NULL WHERE `kind` = 'dynamic';
--> statement-breakpoint
ALTER TABLE `board` DROP COLUMN `column_count`;
--> statement-breakpoint
COMMIT TRANSACTION;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
BEGIN TRANSACTION;