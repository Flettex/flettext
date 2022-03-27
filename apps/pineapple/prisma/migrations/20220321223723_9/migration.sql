-- AlterTable
ALTER TABLE `Role` ADD COLUMN `display` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `mentionable` BOOLEAN NOT NULL DEFAULT false;
