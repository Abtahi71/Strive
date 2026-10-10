/*
  Warnings:

  - You are about to drop the column `streakId` on the `UserTaskAchievement` table. All the data in the column will be lost.
  - You are about to drop the `TaskStreakAchievement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskStreakAchievement" DROP CONSTRAINT "TaskStreakAchievement_taskId_fkey";

-- DropForeignKey
ALTER TABLE "UserTaskAchievement" DROP CONSTRAINT "UserTaskAchievement_streakId_fkey";

-- AlterTable
ALTER TABLE "UserTaskAchievement" DROP COLUMN "streakId",
ADD COLUMN     "completedStreak" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "TaskStreakAchievement";
