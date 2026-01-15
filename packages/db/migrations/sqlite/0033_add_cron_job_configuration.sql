CREATE TABLE `cron_job_configuration` (
	`name` text PRIMARY KEY NOT NULL,
	`cron_expression` text NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL
);
