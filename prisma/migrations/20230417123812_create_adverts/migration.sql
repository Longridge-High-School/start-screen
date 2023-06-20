-- CreateTable
CREATE TABLE "Advert" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "target" TEXT NOT NULL,
    "targets" TEXT[],

    CONSTRAINT "Advert_pkey" PRIMARY KEY ("id")
);
