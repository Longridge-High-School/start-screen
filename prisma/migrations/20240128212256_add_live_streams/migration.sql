-- CreateTable
CREATE TABLE "LiveStream" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "live" BOOLEAN NOT NULL DEFAULT false,
    "key" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "descriptionCache" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "LiveStream_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveStream_key_key" ON "LiveStream"("key");
