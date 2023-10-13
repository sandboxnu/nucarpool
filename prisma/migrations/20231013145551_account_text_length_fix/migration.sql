-- AlterTable
ALTER TABLE `account` MODIFY `refresh_token` MEDIUMTEXT NULL,
    MODIFY `access_token` MEDIUMTEXT NULL,
    MODIFY `scope` MEDIUMTEXT NULL,
    MODIFY `id_token` MEDIUMTEXT NULL;
