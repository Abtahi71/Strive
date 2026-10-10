/*
  Warnings:

  - You are about to drop the column `streak` on the `TaskProgress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskProgress" DROP COLUMN "streak",
ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;
