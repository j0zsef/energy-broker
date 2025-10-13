/*
  Warnings:

  - You are about to drop the `EnergyProviderAuth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EnergyProviderAuth` DROP FOREIGN KEY `EnergyProviderAuth_energyProviderId_fkey`;

-- DropForeignKey
ALTER TABLE `EnergyProviderAuth` DROP FOREIGN KEY `EnergyProviderAuth_userId_fkey`;

-- DropTable
DROP TABLE `EnergyProviderAuth`;

-- CreateTable
CREATE TABLE `EnergyProviderConnection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `authToken` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `refreshToken` TEXT NOT NULL,
    `resourceUri` VARCHAR(191) NOT NULL,
    `energyProviderId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnergyProviderConnection` ADD CONSTRAINT `EnergyProviderConnection_energyProviderId_fkey` FOREIGN KEY (`energyProviderId`) REFERENCES `EnergyProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnergyProviderConnection` ADD CONSTRAINT `EnergyProviderConnection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
