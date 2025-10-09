/*
  Warnings:

  - A unique constraint covering the columns `[clientId]` on the table `OAuthProviderConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `EnergyProviderLocation_zip_key` ON `EnergyProviderLocation`;

-- CreateIndex
CREATE UNIQUE INDEX `OAuthProviderConfig_clientId_key` ON `OAuthProviderConfig`(`clientId`);
