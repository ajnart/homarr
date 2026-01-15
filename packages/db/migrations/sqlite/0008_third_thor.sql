CREATE TABLE `search_engine` (
	`id` text PRIMARY KEY NOT NULL,
	`icon_url` text NOT NULL,
	`name` text NOT NULL,
	`short` text NOT NULL,
	`description` text,
	`url_template` text NOT NULL
);
