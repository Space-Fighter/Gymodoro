-- AlterTable
ALTER TABLE "Session" ADD COLUMN "breakMode" TEXT,
ADD COLUMN "pausedRemaining" INTEGER,
ADD COLUMN "phaseEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Session_userId_status_idx" ON "Session"("userId", "status");
