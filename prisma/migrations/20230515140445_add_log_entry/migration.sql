-- CreateTable
CREATE TABLE "LogEntry" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "system" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);
