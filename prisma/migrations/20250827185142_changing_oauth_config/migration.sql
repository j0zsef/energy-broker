/*
  Warnings:

  - You are about to drop the column `clientId` on the `OAuthProviderConfig` table. All the data in the column will be lost.
  - You are about to drop the column `clientSecret` on the `OAuthProviderConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OAuthProviderConfig` DROP COLUMN `clientId`,
    DROP COLUMN `clientSecret`;
