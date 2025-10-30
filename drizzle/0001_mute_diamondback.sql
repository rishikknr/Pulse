CREATE TABLE `alert_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ruleType` enum('consecutive_failures','uptime_percentage','response_time') NOT NULL,
	`threshold` int NOT NULL,
	`notificationChannels` varchar(500) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alert_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ruleId` int NOT NULL,
	`targetId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('triggered','acknowledged','resolved') NOT NULL DEFAULT 'triggered',
	`message` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`acknowledgedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`statusCode` int,
	`responseTime` int,
	`isSuccess` boolean NOT NULL,
	`errorMessage` text,
	`checkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `monitoring_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monitoring_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(2048) NOT NULL,
	`description` text,
	`protocol` enum('http','https') NOT NULL DEFAULT 'https',
	`method` enum('GET','POST','HEAD') NOT NULL DEFAULT 'GET',
	`checkInterval` int NOT NULL DEFAULT 60,
	`timeout` int NOT NULL DEFAULT 10,
	`expectedStatusCode` int NOT NULL DEFAULT 200,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monitoring_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`slackWebhookUrl` varchar(2048),
	`discordWebhookUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `uptime_statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`period` enum('daily','weekly','monthly') NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalChecks` int NOT NULL DEFAULT 0,
	`successfulChecks` int NOT NULL DEFAULT 0,
	`uptimePercentage` decimal(5,2) NOT NULL DEFAULT '100.00',
	`averageResponseTime` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uptime_statistics_id` PRIMARY KEY(`id`)
);
