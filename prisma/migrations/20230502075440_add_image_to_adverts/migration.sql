/*
  Warnings:

  - Added the required column `image` to the `Advert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advert" ADD COLUMN     "image" TEXT NOT NULL;
