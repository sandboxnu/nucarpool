/*
  Warnings:

  - Added the required column `end_time` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `bio` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `days_working` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `end_time` TIME(0) NOT NULL,
    ADD COLUMN `pronouns` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `start_coord_lat` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `start_coord_lng` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `start_time` TIME(0) NOT NULL;
