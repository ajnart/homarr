CREATE TABLE `item_layout` (
	`item_id` text NOT NULL,
	`section_id` text NOT NULL,
	`layout_id` text NOT NULL,
	`x_offset` integer NOT NULL,
	`y_offset` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	PRIMARY KEY(`item_id`, `section_id`, `layout_id`),
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`layout_id`) REFERENCES `layout`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `layout` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`board_id` text NOT NULL,
	`column_count` integer NOT NULL,
	`breakpoint` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `section_layout` (
	`section_id` text NOT NULL,
	`layout_id` text NOT NULL,
	`parent_section_id` text,
	`x_offset` integer NOT NULL,
	`y_offset` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	PRIMARY KEY(`section_id`, `layout_id`),
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`layout_id`) REFERENCES `layout`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO "layout"("id", "name", "board_id", "column_count") SELECT id, 'Base', id, column_count FROM board;
--> statement-breakpoint
INSERT INTO "item_layout"("item_id", "section_id", "layout_id", "x_offset", "y_offset", "width", "height") SELECT item.id, section.id, board.id, item.x_offset, item.y_offset, item.width, item.height FROM board LEFT JOIN section ON section.board_id=board.id LEFT JOIN item ON item.section_id=section.id WHERE item.id IS NOT NULL;
--> statement-breakpoint
INSERT INTO "section_layout"("section_id", "layout_id", "parent_section_id", "x_offset", "y_offset", "width", "height") SELECT section.id, board.id, section.parent_section_id, section.x_offset, section.y_offset, section.width, section.height FROM board LEFT JOIN section ON section.board_id=board.id WHERE section.id IS NOT NULL AND section.kind = 'dynamic';
