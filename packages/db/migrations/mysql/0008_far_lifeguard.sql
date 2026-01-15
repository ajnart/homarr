CREATE TABLE `search_engine` (
	`id` varchar(64) NOT NULL,
	`icon_url` text NOT NULL,
	`name` varchar(64) NOT NULL,
	`short` varchar(8) NOT NULL,
	`description` text,
	`url_template` text NOT NULL,
	CONSTRAINT `search_engine_id` PRIMARY KEY(`id`)
);
