CREATE TABLE `trusted_certificate_hostname` (
	`hostname` varchar(256) NOT NULL,
	`thumbprint` varchar(128) NOT NULL,
	`certificate` text NOT NULL,
	CONSTRAINT `trusted_certificate_hostname_hostname_thumbprint_pk` PRIMARY KEY(`hostname`,`thumbprint`)
);
