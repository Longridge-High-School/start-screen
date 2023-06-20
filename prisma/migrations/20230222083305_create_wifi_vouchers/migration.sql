-- CreateTable
CREATE TABLE "WirelessVoucher" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL,

    CONSTRAINT "WirelessVoucher_pkey" PRIMARY KEY ("id")
);
