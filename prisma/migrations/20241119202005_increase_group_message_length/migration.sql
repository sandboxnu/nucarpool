-- AlterTable
ALTER TABLE `conversation` ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `group` ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `coop_end_date` DATE NULL,
    ADD COLUMN `coop_start_date` DATE NULL,
    ADD COLUMN `dateCreated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dateModified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `group_message` TEXT NULL,
    MODIFY `role` ENUM('RIDER', 'DRIVER', 'VIEWER') NOT NULL DEFAULT 'VIEWER';