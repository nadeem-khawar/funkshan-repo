-- AlterTable: Add timezone field to users table
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;

-- AlterTable: Add venueTimezone field to events table (NOT NULL with default for existing rows)
ALTER TABLE "events" ADD COLUMN "venueTimezone" TEXT NOT NULL DEFAULT 'UTC';

-- Remove default after backfilling existing data
-- Note: In production, you should update existing records with proper timezones before removing the default
-- For now, we keep the default as 'UTC' for data integrity
