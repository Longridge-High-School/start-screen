-- CreateEnum
CREATE TYPE "InfoMessageType" AS ENUM ('Info', 'Warning', 'Danger');

-- CreateTable
CREATE TABLE "InfoMessage" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "type" "InfoMessageType" NOT NULL,
    "scopes" TEXT[],

    CONSTRAINT "InfoMessage_pkey" PRIMARY KEY ("id")
);
