-- AlterTable
ALTER TABLE `EnergyProviderAuth` MODIFY `authToken` TEXT NOT NULL,
    MODIFY `refreshToken` TEXT NOT NULL;
