/*
  Warnings:

  - The `scopes` column on the `InfoMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InfoMessage" DROP COLUMN "scopes",
ADD COLUMN     "scopes" TEXT[];
