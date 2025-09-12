/*
  Warnings:

  - You are about to drop the column `providerName` on the `OAuthProviderConfig` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `OAuthProviderConfig_providerName_key` ON `OAuthProviderConfig`;

-- AlterTable
ALTER TABLE `OAuthProviderConfig` DROP COLUMN `providerName`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `EnergyProvider` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `oAuthProviderConfigId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EnergyProvider_name_key`(`name`),
    UNIQUE INDEX `EnergyProvider_oAuthProviderConfigId_key`(`oAuthProviderConfigId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnergyProviderLocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zip` VARCHAR(191) NOT NULL,
    `energyProviderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EnergyProviderLocation_zip_key`(`zip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnergyProviderAuth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `authToken` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `resourceUri` VARCHAR(191) NOT NULL,
    `energyProviderId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnergyProvider` ADD CONSTRAINT `EnergyProvider_oAuthProviderConfigId_fkey` FOREIGN KEY (`oAuthProviderConfigId`) REFERENCES `OAuthProviderConfig`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnergyProviderLocation` ADD CONSTRAINT `EnergyProviderLocation_energyProviderId_fkey` FOREIGN KEY (`energyProviderId`) REFERENCES `EnergyProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnergyProviderAuth` ADD CONSTRAINT `EnergyProviderAuth_energyProviderId_fkey` FOREIGN KEY (`energyProviderId`) REFERENCES `EnergyProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnergyProviderAuth` ADD CONSTRAINT `EnergyProviderAuth_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
