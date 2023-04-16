/*
  Warnings:

  - The primary key for the `group` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `_userCarpools` MODIFY `A` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `group` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
