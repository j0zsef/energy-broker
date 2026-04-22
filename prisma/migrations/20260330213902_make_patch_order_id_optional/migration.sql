-- CreateTable
CREATE TABLE `CarbonCreditOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patchOrderId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `massGrams` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    `state` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `projectId` VARCHAR(191) NULL,
    `projectName` VARCHAR(191) NULL,
    `projectType` VARCHAR(191) NULL,
    `vintageYear` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CarbonCreditOrder_patchOrderId_key`(`patchOrderId`),
    INDEX `CarbonCreditOrder_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
