/*
  Warnings:

  - A unique constraint covering the columns `[userId,guildId]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Relationships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Channel` ADD COLUMN `parentId` INTEGER NULL,
    ADD COLUMN `ratelimit` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `type` ENUM('textChannel', 'categoryChannel') NOT NULL;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `permissions` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `Relationships` ADD COLUMN `type` ENUM('friend', 'shared', 'blocked', 'pendingSender', 'pendingReceiver') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_userId_guildId_key` ON `Member`(`userId`, `guildId`);
