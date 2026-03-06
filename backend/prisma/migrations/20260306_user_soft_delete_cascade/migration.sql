-- Migration: Add soft delete to users + cascade delete on remaining child tables
-- Generated: 2026-03-06
-- DO NOT apply without review. Run: npx prisma db execute --file this_file.sql

-- Step 1: Add soft delete columns to users table
ALTER TABLE "users" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "deleted_by" TEXT;

-- Step 2: Add ON DELETE CASCADE to foreign keys that were missing it
-- (6 tables: sms_messages, sms_sequences, viewer_passes, LeadHunterFile, LeadHunterMemory, MCPConnection)

-- sms_messages.userId -> users.id
ALTER TABLE "sms_messages" DROP CONSTRAINT IF EXISTS "sms_messages_userId_fkey";
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- sms_sequences.userId -> users.id
ALTER TABLE "sms_sequences" DROP CONSTRAINT IF EXISTS "sms_sequences_userId_fkey";
ALTER TABLE "sms_sequences" ADD CONSTRAINT "sms_sequences_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- viewer_passes.userId -> users.id
ALTER TABLE "viewer_passes" DROP CONSTRAINT IF EXISTS "viewer_passes_userId_fkey";
ALTER TABLE "viewer_passes" ADD CONSTRAINT "viewer_passes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LeadHunterFile.userId -> users.id
ALTER TABLE "LeadHunterFile" DROP CONSTRAINT IF EXISTS "LeadHunterFile_userId_fkey";
ALTER TABLE "LeadHunterFile" ADD CONSTRAINT "LeadHunterFile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LeadHunterMemory.userId -> users.id
ALTER TABLE "LeadHunterMemory" DROP CONSTRAINT IF EXISTS "LeadHunterMemory_userId_fkey";
ALTER TABLE "LeadHunterMemory" ADD CONSTRAINT "LeadHunterMemory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MCPConnection.userId -> users.id
ALTER TABLE "MCPConnection" DROP CONSTRAINT IF EXISTS "MCPConnection_userId_fkey";
ALTER TABLE "MCPConnection" ADD CONSTRAINT "MCPConnection_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for efficient soft-delete queries
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");
