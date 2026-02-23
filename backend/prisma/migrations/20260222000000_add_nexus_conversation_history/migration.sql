-- NEXUS Conversation History Table
-- Stores all messages for persistent memory across sessions

CREATE TABLE IF NOT EXISTS "conversation_history" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "session_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB DEFAULT '{}',
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),

  -- Agent tracking
  "agent_name" TEXT,
  "agent_action" TEXT,
  "tool_calls" JSONB,

  -- Thread relationships
  "parent_message_id" TEXT REFERENCES "conversation_history"("id") ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_conversation_user_session" ON "conversation_history"("user_id", "session_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_timestamp" ON "conversation_history"("timestamp" DESC);
CREATE INDEX IF NOT EXISTS "idx_conversation_session" ON "conversation_history"("session_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_agent" ON "conversation_history"("agent_name") WHERE "agent_name" IS NOT NULL;

-- File uploads table (linked to conversation)
CREATE TABLE IF NOT EXISTS "conversation_files" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "conversation_id" TEXT NOT NULL REFERENCES "conversation_history"("id") ON DELETE CASCADE,
  "file_id" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "filepath" TEXT NOT NULL,
  "mimetype" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "extracted_text" TEXT,
  "uploaded_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_conversation_files_conversation" ON "conversation_files"("conversation_id");

COMMENT ON TABLE "conversation_history" IS 'NEXUS conversation memory - persists across sessions';
COMMENT ON TABLE "conversation_files" IS 'Files uploaded in NEXUS conversations';
