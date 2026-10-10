-- AlterEnum
ALTER TYPE "IconType" ADD VALUE 'EMOJI';

-- AlterTable
ALTER TABLE "TaskAchievement" ALTER COLUMN "iconType" SET DEFAULT 'DEFAULT';
