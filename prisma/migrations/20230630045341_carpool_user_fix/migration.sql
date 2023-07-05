/*
  Warnings:

  - You are about to drop the `_userCarpools` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `carpoolId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `_userCarpools`;

-- CreateIndex
CREATE INDEX `user_carpoolId_idx` ON `user`(`carpoolId`);
