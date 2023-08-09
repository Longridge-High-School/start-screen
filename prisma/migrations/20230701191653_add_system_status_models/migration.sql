-- CreateEnum
CREATE TYPE "ComponentState" AS ENUM ('Operational', 'PerformanceIssues', 'PartialOutage', 'MajorOutage');

-- CreateTable
CREATE TABLE "ComponentGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "defaultExpanded" BOOLEAN NOT NULL,

    CONSTRAINT "ComponentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Component" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state" "ComponentState" NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionCache" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "parentId" INTEGER NOT NULL,
    "state" "ComponentState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Component" ADD CONSTRAINT "Component_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ComponentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
