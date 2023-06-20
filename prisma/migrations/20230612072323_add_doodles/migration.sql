-- CreateTable
CREATE TABLE "Doodle" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "body" TEXT NOT NULL,
    "bodyCache" TEXT NOT NULL,

    CONSTRAINT "Doodle_pkey" PRIMARY KEY ("id")
);
