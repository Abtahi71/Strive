-- CreateTable
CREATE TABLE "GoogleLoginCode" (
    "id" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleLoginCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleLoginCode_codeHash_key" ON "GoogleLoginCode"("codeHash");

-- CreateIndex
CREATE INDEX "GoogleLoginCode_expiresAt_idx" ON "GoogleLoginCode"("expiresAt");

-- AddForeignKey
ALTER TABLE "GoogleLoginCode" ADD CONSTRAINT "GoogleLoginCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
