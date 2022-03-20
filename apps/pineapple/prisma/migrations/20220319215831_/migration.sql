/*
  Warnings:

  - A unique constraint covering the columns `[invite]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Channel` MODIFY `type` ENUM('textChannel', 'categoryChannel', 'DMChannel') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Guild_invite_key` ON `Guild`(`invite`);
