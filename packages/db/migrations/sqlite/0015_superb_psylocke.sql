PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_search_engine` (
	`id` text PRIMARY KEY NOT NULL,
	`icon_url` text NOT NULL,
	`name` text NOT NULL,
	`short` text NOT NULL,
	`description` text,
	`url_template` text,
	`type` text DEFAULT 'generic' NOT NULL,
	`integration_id` text,
	FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_search_engine`("id", "icon_url", "name", "short", "description", "url_template") SELECT "id", "icon_url", "name", "short", "description", "url_template" FROM `search_engine`;--> statement-breakpoint
DROP TABLE `search_engine`;--> statement-breakpoint
ALTER TABLE `__new_search_engine` RENAME TO `search_engine`;--> statement-breakpoint
PRAGMA foreign_keys=ON;