ALTER TABLE `search_engine` MODIFY COLUMN `url_template` text;--> statement-breakpoint
ALTER TABLE `search_engine` ADD `type` varchar(64) DEFAULT 'generic' NOT NULL;--> statement-breakpoint
ALTER TABLE `search_engine` ADD `integration_id` varchar(64);--> statement-breakpoint
ALTER TABLE `search_engine` ADD CONSTRAINT `search_engine_integration_id_integration_id_fk` FOREIGN KEY (`integration_id`) REFERENCES `integration`(`id`) ON DELETE cascade ON UPDATE no action;