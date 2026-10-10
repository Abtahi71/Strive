-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('VALUE', 'CHECKLIST');

-- AlterTable
ALTER TABLE "ActivityTask" ADD COLUMN     "taskType" "TaskType" NOT NULL DEFAULT 'VALUE';
