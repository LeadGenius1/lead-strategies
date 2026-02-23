const { PrismaClient } = require('@prisma/client');

async function runMigration() {
  const prisma = new PrismaClient();

  try {
    process.stdout.write('Starting NEXUS migration...\n');

    // Create conversation_history table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "conversation_history" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "session_id" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "metadata" JSONB DEFAULT '{}',
        "timestamp" TIMESTAMPTZ DEFAULT NOW(),
        "agent_name" TEXT,
        "agent_action" TEXT,
        "tool_calls" JSONB,
        "parent_message_id" TEXT REFERENCES "conversation_history"("id") ON DELETE SET NULL
      )
    `);
    process.stdout.write('conversation_history table: OK\n');

    // Indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_ch_user_session" ON "conversation_history"("user_id", "session_id")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_ch_timestamp" ON "conversation_history"("timestamp" DESC)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_ch_session" ON "conversation_history"("session_id")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_ch_agent" ON "conversation_history"("agent_name") WHERE "agent_name" IS NOT NULL`);
    process.stdout.write('conversation_history indexes: OK\n');

    // Create conversation_files table
    await prisma.$executeRawUnsafe(`
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
      )
    `);
    process.stdout.write('conversation_files table: OK\n');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_cf_conv" ON "conversation_files"("conversation_id")`);
    process.stdout.write('conversation_files index: OK\n');

    // Verify
    const result = await prisma.$queryRawUnsafe(`SELECT count(*) as c FROM conversation_history`);
    process.stdout.write('VERIFY: conversation_history accessible, rows: ' + result[0].c + '\n');

    const result2 = await prisma.$queryRawUnsafe(`SELECT count(*) as c FROM conversation_files`);
    process.stdout.write('VERIFY: conversation_files accessible, rows: ' + result2[0].c + '\n');

    process.stdout.write('MIGRATION COMPLETE\n');
  } catch (error) {
    process.stderr.write('MIGRATION ERROR: ' + error.message + '\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
