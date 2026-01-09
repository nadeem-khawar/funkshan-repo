-- AlterEnum: Add new invite types to InviteType enum
ALTER TYPE "InviteType" ADD VALUE 'PLUS_THREE';
ALTER TYPE "InviteType" ADD VALUE 'PLUS_FOUR';
ALTER TYPE "InviteType" ADD VALUE 'PLUS_FIVE';
ALTER TYPE "InviteType" ADD VALUE 'PLUS_SIX';

-- AlterTable: Add draft mode fields to events table
ALTER TABLE "events" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "events" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateIndex: Add index for draft status filtering
CREATE INDEX "events_isDraft_idx" ON "events"("isDraft");

-- Update existing events to be published (not drafts)
UPDATE "events" SET "isDraft" = false, "publishedAt" = "createdAt" WHERE "isActive" = true;
