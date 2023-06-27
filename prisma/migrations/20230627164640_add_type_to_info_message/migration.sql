/*
  Warnings:

  - Added the required column `type` to the `InfoMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InfoMessageType" AS ENUM ('Info', 'Warning', 'Danger');

-- AlterTable
ALTER TABLE "InfoMessage" ADD COLUMN     "type" "InfoMessageType" NOT NULL;
