-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "rsvpToken" TEXT,
ADD COLUMN     "rsvpTokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "guests_rsvpToken_key" ON "guests"("rsvpToken");

-- CreateIndex
CREATE INDEX "guests_rsvpToken_idx" ON "guests"("rsvpToken");
