-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_classId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSession" DROP CONSTRAINT "StudentSession_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSession" DROP CONSTRAINT "StudentSession_studentId_fkey";

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSession" ADD CONSTRAINT "StudentSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
