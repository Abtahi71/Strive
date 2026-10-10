-- CreateEnum
CREATE TYPE "IconType" AS ENUM ('DEFAULT', 'ICON', 'PREBUILT', 'CUSTOM');

-- AlterTable
ALTER TABLE "TaskAchievement" ADD COLUMN     "iconType" "IconType",
ADD COLUMN     "iconValue" TEXT;

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "options" TEXT[],

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);
