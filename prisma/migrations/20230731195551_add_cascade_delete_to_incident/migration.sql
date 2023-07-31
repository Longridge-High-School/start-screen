-- DropForeignKey
ALTER TABLE "Incident" DROP CONSTRAINT "Incident_parentId_fkey";

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
