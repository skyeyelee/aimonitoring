ALTER TABLE `sites` ADD `deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `version` integer DEFAULT 1 NOT NULL;