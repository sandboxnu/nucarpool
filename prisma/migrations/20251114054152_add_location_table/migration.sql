/*
  Warnings:

  - You are about to drop the column `company_poi_address` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_poi_coord_lat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_poi_coord_lng` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_poi_coord_lat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_poi_coord_lng` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_poi_location` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `group` MODIFY `message` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `company_poi_address`,
    DROP COLUMN `company_poi_coord_lat`,
    DROP COLUMN `company_poi_coord_lng`,
    DROP COLUMN `start_poi_coord_lat`,
    DROP COLUMN `start_poi_coord_lng`,
    DROP COLUMN `start_poi_location`,
    ADD COLUMN `company_city` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `company_state` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `company_street` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `permission` ENUM('USER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'USER',
    ADD COLUMN `start_city` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `start_state` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `start_street` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `location` (
    `id` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL DEFAULT '',
    `state` VARCHAR(191) NOT NULL DEFAULT '',
    `street` VARCHAR(191) NOT NULL DEFAULT '',
    `street_address` VARCHAR(191) NOT NULL DEFAULT '',
    `coord_lng` DOUBLE NOT NULL DEFAULT 0,
    `coord_lat` DOUBLE NOT NULL DEFAULT 0,
    `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dateModified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
