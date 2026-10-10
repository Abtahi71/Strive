-- /*
--   Warnings:

--   - You are about to drop the column `acitivtyId` on the `ActivityTask` table. All the data in the column will be lost.
--   - Added the required column `activityId` to the `ActivityTask` table without a default value. This is not possible if the table is not empty.

-- */
-- -- DropForeignKey
-- ALTER TABLE "ActivityTask" DROP CONSTRAINT "ActivityTask_acitivtyId_fkey";

-- -- DropIndex
-- DROP INDEX "ActivityTask_acitivtyId_idx";

-- -- AlterTable
-- ALTER TABLE "ActivityTask" DROP COLUMN "acitivtyId",
-- ADD COLUMN     "activityId" TEXT NOT NULL;

-- -- CreateIndex
-- CREATE INDEX "ActivityTask_activityId_idx" ON "ActivityTask"("activityId");

-- -- AddForeignKey
-- ALTER TABLE "ActivityTask" ADD CONSTRAINT "ActivityTask_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Drop the old foreign key
ALTER TABLE "ActivityTask"
DROP CONSTRAINT "ActivityTask_acitivtyId_fkey";

-- Rename the column
ALTER TABLE "ActivityTask"
RENAME COLUMN "acitivtyId" TO "activityId";

-- Rename the index
ALTER INDEX "ActivityTask_acitivtyId_idx"
RENAME TO "ActivityTask_activityId_idx";

-- Recreate the foreign key using the renamed column
ALTER TABLE "ActivityTask"
ADD CONSTRAINT "ActivityTask_activityId_fkey"
FOREIGN KEY ("activityId")
REFERENCES "Activity"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;