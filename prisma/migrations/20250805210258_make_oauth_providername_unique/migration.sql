/*
  Warnings:

  - A unique constraint covering the columns `[providerName]` on the table `OAuthProviderConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `OAuthProviderConfig_providerName_key` ON `OAuthProviderConfig`(`providerName`);
