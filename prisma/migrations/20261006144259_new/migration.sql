-- CreateTable
CREATE TABLE "WebsiteUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteUsage_userId_startedAt_idx" ON "WebsiteUsage"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "WebsiteUsage_userId_domain_idx" ON "WebsiteUsage"("userId", "domain");

-- CreateIndex
CREATE INDEX "WebsiteUsage_sessionId_idx" ON "WebsiteUsage"("sessionId");

-- CreateIndex
CREATE INDEX "WebsiteUsage_domain_idx" ON "WebsiteUsage"("domain");

-- AddForeignKey
ALTER TABLE "WebsiteUsage" ADD CONSTRAINT "WebsiteUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteUsage" ADD CONSTRAINT "WebsiteUsage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
