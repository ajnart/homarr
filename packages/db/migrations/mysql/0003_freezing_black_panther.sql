CREATE TABLE `serverSetting` (
	`key` varchar(64) NOT NULL,
	`value` text NOT NULL DEFAULT ('{"json": {}}'),
	CONSTRAINT `serverSetting_key` PRIMARY KEY(`key`),
	CONSTRAINT `serverSetting_key_unique` UNIQUE(`key`)
);
