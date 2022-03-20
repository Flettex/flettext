/*
  Warnings:

  - You are about to alter the column `position` on the `Channel` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Added the required column `invite` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Channel` MODIFY `position` FLOAT NOT NULL;

-- AlterTable
ALTER TABLE `Guild` ADD COLUMN `invite` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Member` ADD COLUMN `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Role` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `permission` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
