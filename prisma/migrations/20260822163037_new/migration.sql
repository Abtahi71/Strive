/*
  Warnings:

  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "UserAchievement";

-- CreateTable
CREATE TABLE "TaskAchievement" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "totalValue" INTEGER NOT NULL,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTaskAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "isEarned" BOOLEAN NOT NULL,
    "completedValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserTaskAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTaskAchievement_userId_idx" ON "UserTaskAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserTaskAchievement_achievementId_idx" ON "UserTaskAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskAchievement_userId_achievementId_key" ON "UserTaskAchievement"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "TaskAchievement" ADD CONSTRAINT "TaskAchievement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ActivityTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskAchievement" ADD CONSTRAINT "UserTaskAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskAchievement" ADD CONSTRAINT "UserTaskAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "TaskAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
