-- CreateTable
CREATE TABLE `carpool_search` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('RIDER', 'DRIVER', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `company_name` VARCHAR(191) NOT NULL DEFAULT '',
    `companyLocationId` VARCHAR(191) NOT NULL,
    `homeLocationId` VARCHAR(191) NOT NULL,
    `start_time` TIME(0) NULL,
    `end_time` TIME(0) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `days_working` VARCHAR(191) NOT NULL DEFAULT '',
    `seats_avail` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `carpoolId` VARCHAR(191) NULL,
    `group_message` TEXT NULL,
    `date_created` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `carpool_search_userId_idx`(`userId`),
    INDEX `carpool_search_companyLocationId_idx`(`companyLocationId`),
    INDEX `carpool_search_homeLocationId_idx`(`homeLocationId`),
    INDEX `carpool_search_carpoolId_idx`(`carpoolId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
