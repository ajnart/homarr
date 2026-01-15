CREATE TABLE `onboarding` (
	`id` varchar(64) NOT NULL,
	`step` varchar(64) NOT NULL,
	`previous_step` varchar(64),
	CONSTRAINT `onboarding_id` PRIMARY KEY(`id`)
);
