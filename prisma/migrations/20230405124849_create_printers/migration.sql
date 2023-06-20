-- CreateTable
CREATE TABLE "Printer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "staffOnly" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL,
    "snmpCommunity" TEXT NOT NULL,
    "blackOID" TEXT NOT NULL,
    "cyanOID" TEXT NOT NULL,
    "magentaOID" TEXT NOT NULL,
    "yellowOID" TEXT NOT NULL,

    CONSTRAINT "Printer_pkey" PRIMARY KEY ("id")
);
