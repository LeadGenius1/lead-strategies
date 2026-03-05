// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — LEAD HUNTER PERSISTENT MEMORY SERVICE
// Stores and retrieves key facts across assistant sessions.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../config/database');

const MAX_MEMORIES_PER_USER = 200;
const VALID_CATEGORIES = ['preference', 'business', 'contact', 'decision', 'general'];

/**
 * Save or update a memory (upserts by userId+category+key).
 */
async function saveMemory(userId, { category, key, value, source }) {
  const cat = VALID_CATEGORIES.includes(category) ? category : 'general';

  // Upsert by unique constraint
  const memory = await prisma.leadHunterMemory.upsert({
    where: {
      userId_category_key: { userId, category: cat, key },
    },
    update: {
      value,
      source: source || 'assistant',
      updatedAt: new Date(),
    },
    create: {
      userId,
      category: cat,
      key,
      value,
      source: source || 'assistant',
    },
  });

  // Auto-prune if over limit
  const count = await prisma.leadHunterMemory.count({ where: { userId } });
  if (count > MAX_MEMORIES_PER_USER) {
    const oldest = await prisma.leadHunterMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'asc' },
      take: count - MAX_MEMORIES_PER_USER,
      select: { id: true },
    });
    if (oldest.length) {
      await prisma.leadHunterMemory.deleteMany({
        where: { id: { in: oldest.map((m) => m.id) } },
      });
    }
  }

  return memory;
}

/**
 * Get all memories for a user, optionally filtered by category.
 */
async function getMemories(userId, category) {
  const where = { userId };
  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  return prisma.leadHunterMemory.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      category: true,
      key: true,
      value: true,
      source: true,
      confidence: true,
      updatedAt: true,
    },
  });
}

/**
 * Delete a specific memory (checks ownership).
 */
async function deleteMemory(userId, memoryId) {
  const memory = await prisma.leadHunterMemory.findFirst({
    where: { id: memoryId, userId },
  });

  if (!memory) return false;

  await prisma.leadHunterMemory.delete({ where: { id: memoryId } });
  return true;
}

/**
 * Simple keyword search on key+value fields.
 */
async function searchMemories(userId, query, category) {
  const where = { userId };
  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  // Use contains for keyword matching
  where.OR = [
    { key: { contains: query, mode: 'insensitive' } },
    { value: { contains: query, mode: 'insensitive' } },
  ];

  return prisma.leadHunterMemory.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      category: true,
      key: true,
      value: true,
      updatedAt: true,
    },
  });
}

/**
 * Format memories as a string block for system prompt injection.
 */
async function formatMemoriesForPrompt(userId) {
  const memories = await getMemories(userId);
  if (!memories.length) return null;

  const grouped = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(`${m.key}: ${m.value}`);
  }

  const lines = [];
  for (const [cat, items] of Object.entries(grouped)) {
    lines.push(`[${cat}]`);
    for (const item of items) {
      lines.push(`  - ${item}`);
    }
  }

  return lines.join('\n');
}

module.exports = {
  saveMemory,
  getMemories,
  deleteMemory,
  searchMemories,
  formatMemoriesForPrompt,
};
