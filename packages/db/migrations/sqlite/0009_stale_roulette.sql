CREATE TABLE `apiKey` (
	`id` text PRIMARY KEY NOT NULL,
	`apiKey` text NOT NULL,
	`salt` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
