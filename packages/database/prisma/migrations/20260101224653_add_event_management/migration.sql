-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('GUEST_ONLY', 'PLUS_ONE', 'PLUS_TWO', 'FAMILY');

-- CreateEnum
CREATE TYPE "EntryMechanism" AS ENUM ('QR_CODE', 'PIN_CODE', 'BOTH');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "details" TEXT,
    "eventImagePath" TEXT,
    "backgroundImagePath" TEXT,
    "venueAddress" TEXT NOT NULL,
    "venueLatitude" DOUBLE PRECISION,
    "venueLongitude" DOUBLE PRECISION,
    "venueLocationImagePath" TEXT,
    "venueMapImagePath" TEXT,
    "entryMechanism" "EntryMechanism",
    "qrCode" TEXT,
    "pinCode" TEXT,
    "dressCode" TEXT,
    "giftSuggestions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "inviteType" "InviteType" NOT NULL DEFAULT 'GUEST_ONLY',
    "hasCheckedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_checkin_agents" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_checkin_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_userId_idx" ON "events"("userId");

-- CreateIndex
CREATE INDEX "events_dateTime_idx" ON "events"("dateTime");

-- CreateIndex
CREATE INDEX "events_isActive_idx" ON "events"("isActive");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "guests_eventId_idx" ON "guests"("eventId");

-- CreateIndex
CREATE INDEX "guests_email_idx" ON "guests"("email");

-- CreateIndex
CREATE INDEX "guests_phoneNumber_idx" ON "guests"("phoneNumber");

-- CreateIndex
CREATE INDEX "guests_hasCheckedIn_idx" ON "guests"("hasCheckedIn");

-- CreateIndex
CREATE UNIQUE INDEX "event_checkin_agents_eventId_userId_key" ON "event_checkin_agents"("eventId", "userId");

-- CreateIndex
CREATE INDEX "event_checkin_agents_eventId_idx" ON "event_checkin_agents"("eventId");

-- CreateIndex
CREATE INDEX "event_checkin_agents_userId_idx" ON "event_checkin_agents"("userId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkin_agents" ADD CONSTRAINT "event_checkin_agents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkin_agents" ADD CONSTRAINT "event_checkin_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
