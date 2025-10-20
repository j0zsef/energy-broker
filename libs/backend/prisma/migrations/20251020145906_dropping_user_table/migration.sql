/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EnergyProviderConnection` DROP FOREIGN KEY `EnergyProviderConnection_userId_fkey`;

-- AlterTable
ALTER TABLE `EnergyProviderConnection` MODIFY `userId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `User`;

-- RenameIndex
ALTER TABLE `EnergyProviderConnection` RENAME INDEX `EnergyProviderConnection_userId_fkey` TO `EnergyProviderConnection_userId_idx`;
