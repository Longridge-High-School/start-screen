-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_parentId_fkey";

-- AlterTable
ALTER TABLE "Incident" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
