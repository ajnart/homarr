CREATE TABLE `app_status_code` (
	`app_id` text NOT NULL,
	`code` integer NOT NULL,
	PRIMARY KEY(`app_id`, `code`),
	FOREIGN KEY (`app_id`) REFERENCES `app`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`code`) REFERENCES `status_code`(`code`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `app` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`internal_url` text NOT NULL,
	`external_url` text,
	`icon_url` text NOT NULL,
	`open_in_new_tab` integer DEFAULT false NOT NULL,
	`is_ping_enabled` integer DEFAULT false NOT NULL,
	`font_size` integer DEFAULT 16 NOT NULL,
	`name_position` text DEFAULT 'top' NOT NULL,
	`name_style` text DEFAULT 'normal' NOT NULL,
	`name_line_clamp` integer DEFAULT 1 NOT NULL,
	`item_id` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `board_integration` (
	`board_id` text NOT NULL,
	`integration_id` text NOT NULL,
	PRIMARY KEY(`board_id`, `integration_id`)
);
--> statement-breakpoint
CREATE TABLE `board` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_ping_enabled` integer DEFAULT false NOT NULL,
	`allow_guests` integer DEFAULT false NOT NULL,
	`page_title` text,
	`meta_title` text,
	`logo_image_url` text,
	`favicon_image_url` text,
	`background_image_url` text,
	`background_image_attachment` text DEFAULT 'fixed' NOT NULL,
	`background_image_repeat` text DEFAULT 'no-repeat' NOT NULL,
	`background_image_size` text DEFAULT 'cover' NOT NULL,
	`primary_color` text DEFAULT 'red' NOT NULL,
	`secondary_color` text DEFAULT 'orange' NOT NULL,
	`primary_shade` integer DEFAULT 6 NOT NULL,
	`app_opacity` integer DEFAULT 100 NOT NULL,
	`custom_css` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integration_secret` (
	`key` text NOT NULL,
	`value` text,
	`integration_id` text NOT NULL,
	PRIMARY KEY(`integration_id`, `key`),
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `integration` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`board_id` text NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `layout_item` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text NOT NULL,
	`item_id` text NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `layout` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`show_right_sidebar` integer DEFAULT false NOT NULL,
	`show_left_sidebar` integer DEFAULT false NOT NULL,
	`column_count` integer DEFAULT 10 NOT NULL,
	`board_id` text NOT NULL,
	FOREIGN KEY (`board_id`) REFERENCES `board`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `section` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`position` integer,
	`name` text,
	`layout_id` text NOT NULL,
	FOREIGN KEY (`layout_id`) REFERENCES `layout`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `status_code` (
	`code` integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `widget_integration` (
	`widget_id` text NOT NULL,
	`integration_id` text NOT NULL,
	PRIMARY KEY(`integration_id`, `widget_id`),
	FOREIGN KEY (`widget_id`) REFERENCES `widget`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `widget_option` (
	`path` text NOT NULL,
	`value` text,
	`type` text NOT NULL,
	`widget_id` text NOT NULL,
	PRIMARY KEY(`path`, `widget_id`),
	FOREIGN KEY (`widget_id`) REFERENCES `widget`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `widget` (
	`id` text PRIMARY KEY NOT NULL,
	`sort` text NOT NULL,
	`item_id` text NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade
);
