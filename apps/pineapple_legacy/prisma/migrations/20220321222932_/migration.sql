/*
  Warnings:

  - Added the required column `guildId` to the `Role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Role` ADD COLUMN `guildId` INTEGER UNSIGNED NOT NULL;
