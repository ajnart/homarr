CREATE TABLE `cron_job_configuration` (
	`name` varchar(256) NOT NULL,
	`cron_expression` varchar(32) NOT NULL,
	`is_enabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `cron_job_configuration_name` PRIMARY KEY(`name`)
);
