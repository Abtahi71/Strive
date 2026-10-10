-- DropIndex
DROP INDEX "ActivityInvitation_activityId_idx";

-- DropIndex
DROP INDEX "ActivityInvitation_receiverId_idx";

-- CreateIndex
CREATE INDEX "ActivityInvitation_receiverId_activityId_senderId_idx" ON "ActivityInvitation"("receiverId", "activityId", "senderId");
