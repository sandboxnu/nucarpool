/*
  Warnings:

  - Made the column `userId` on table `message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `message` ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `request` ADD COLUMN `conversationId` VARCHAR(191) NULL,
    ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `request_conversationId_idx` ON `request`(`conversationId`);
