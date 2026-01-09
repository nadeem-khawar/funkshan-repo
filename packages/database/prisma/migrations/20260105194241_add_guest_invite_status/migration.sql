-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'SENT', 'ACCEPTED', 'REJECTED', 'MAYBE', 'CANCELLED');

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "venueTimezone" DROP DEFAULT;

-- AlterTable
ALTER TABLE "guests" ADD COLUMN     "inviteRespondedAt" TIMESTAMP(3),
ADD COLUMN     "inviteSentAt" TIMESTAMP(3),
ADD COLUMN     "inviteStatus" "InviteStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "guests_inviteStatus_idx" ON "guests"("inviteStatus");
