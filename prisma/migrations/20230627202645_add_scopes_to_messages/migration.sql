/*
  Warnings:

  - Added the required column `scopes` to the `InfoMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InfoMessage" ADD COLUMN     "scopes" TEXT NOT NULL;
