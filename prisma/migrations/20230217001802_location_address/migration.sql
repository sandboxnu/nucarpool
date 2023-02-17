/*
  Warnings:

  - You are about to drop the column `start_location` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `start_location`,
    ADD COLUMN `start_address` VARCHAR(191) NOT NULL DEFAULT '';
