/*
  Warnings:

  - Added the required column `streakId` to the `UserTaskAchievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTaskAchievement" ADD COLUMN     "streakId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TaskStreakAchievement" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "streak" INTEGER NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStreakAchievement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskStreakAchievement" ADD CONSTRAINT "TaskStreakAchievement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ActivityTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskAchievement" ADD CONSTRAINT "UserTaskAchievement_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "TaskStreakAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
