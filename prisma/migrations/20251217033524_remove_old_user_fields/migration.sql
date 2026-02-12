/*
  Warnings:

  - You are about to drop the column `carpoolId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_address` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_city` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_coord_lat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_coord_lng` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_state` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `company_street` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `coop_end_date` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `coop_start_date` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `days_working` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `group_message` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `seat_avail` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_address` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_city` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_coord_lat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_coord_lng` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_state` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_street` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_carpoolId_idx` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `carpoolId`,
    DROP COLUMN `company_address`,
    DROP COLUMN `company_city`,
    DROP COLUMN `company_coord_lat`,
    DROP COLUMN `company_coord_lng`,
    DROP COLUMN `company_name`,
    DROP COLUMN `company_state`,
    DROP COLUMN `company_street`,
    DROP COLUMN `coop_end_date`,
    DROP COLUMN `coop_start_date`,
    DROP COLUMN `days_working`,
    DROP COLUMN `end_time`,
    DROP COLUMN `group_message`,
    DROP COLUMN `role`,
    DROP COLUMN `seat_avail`,
    DROP COLUMN `start_address`,
    DROP COLUMN `start_city`,
    DROP COLUMN `start_coord_lat`,
    DROP COLUMN `start_coord_lng`,
    DROP COLUMN `start_state`,
    DROP COLUMN `start_street`,
    DROP COLUMN `start_time`,
    DROP COLUMN `status`;
