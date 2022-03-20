/*
  Warnings:

  - You are about to drop the column `recipientId` on the `Channel` table. All the data in the column will be lost.
  - You are about to alter the column `parentId` on the `Channel` table. The data in that column could be lost. The data in that column will be cast from `Int` to `UnsignedInt`.

*/
-- AlterTable
ALTER TABLE `Channel` DROP COLUMN `recipientId`,
    MODIFY `parentId` INTEGER UNSIGNED NULL;

-- CreateTable
CREATE TABLE `Recipient` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER UNSIGNED NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Recipient_userId_channelId_key`(`userId`, `channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add Checks
ALTER TABLE `Channel` ADD CONSTRAINT `OtherChannel_not_null`
CHECK (
  (
    (`type` <> _utf8mb4'DMChannel')
      OR 
    (
      (`guildId` IS NULL) AND
      (`name` IS NULL) AND
      (`description` IS NULL) AND
      (`position` IS NULL) AND 
      (`parentId` IS NULL) AND
      (`ratelimit` = _utf8mb4'0')
    )
  )
);
ALTER TABLE `Channel` ADD CONSTRAINT `DMChannel_null`
CHECK (
  (
    (`type` = _utf8mb4'DMChannel') OR
    (
      (`guildId` IS NOT NULL) AND
      (`name` IS NOT NULL) AND
      (`position` IS NOT NULL)
    )
  )
);