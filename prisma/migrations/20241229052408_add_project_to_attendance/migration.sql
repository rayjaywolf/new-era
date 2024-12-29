/*
  Warnings:

  - Added the required column `projectId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Attendance_projectId_idx" ON "Attendance"("projectId");
