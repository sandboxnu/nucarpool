/*
  Warnings:

  - You are about to drop the `invitation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `invitation`;

-- CreateTable
CREATE TABLE `request` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `fromUserId` VARCHAR(191) NOT NULL,
    `toUserId` VARCHAR(191) NOT NULL,

    INDEX `request_fromUserId_idx`(`fromUserId`),
    INDEX `request_toUserId_idx`(`toUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
