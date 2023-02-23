-- AlterTable
ALTER TABLE `user` ADD COLUMN `company_poi_address` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `company_poi_coord_lat` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `company_poi_coord_lng` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `start_poi_coord_lat` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `start_poi_coord_lng` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `start_poi_location` VARCHAR(191) NOT NULL DEFAULT '';
