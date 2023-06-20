-- CreateTable
CREATE TABLE "Shortcut" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "scopes" TEXT[],
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Shortcut_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shortcut" ADD CONSTRAINT "Shortcut_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
