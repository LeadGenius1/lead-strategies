const { v4: uuidv4 } = require('uuid');

/**
 * Conversation Manager
 * Handles persistent conversation history for NEXUS
 */
class ConversationManager {
  constructor(prisma, userId) {
    this.prisma = prisma;
    this.userId = userId;
    this.currentSessionId = null;
  }

  /**
   * Initialize new session or load existing
   */
  async initializeSession(sessionId = null) {
    if (sessionId) {
      this.currentSessionId = sessionId;
    } else {
      this.currentSessionId = uuidv4();
    }
    return this.currentSessionId;
  }

  /**
   * Add message to conversation history
   */
  async addMessage({ role, content, agentName = null, agentAction = null, toolCalls = null, metadata = {} }) {
    if (!this.currentSessionId) {
      await this.initializeSession();
    }

    const message = await this.prisma.conversationHistory.create({
      data: {
        userId: this.userId,
        sessionId: this.currentSessionId,
        role,
        content,
        agentName,
        agentAction,
        toolCalls,
        metadata,
      },
    });

    return message;
  }

  /**
   * Get conversation history for current session
   */
  async getHistory(limit = 50) {
    if (!this.currentSessionId) {
      return [];
    }

    const messages = await this.prisma.conversationHistory.findMany({
      where: {
        sessionId: this.currentSessionId,
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: limit,
    });

    return messages;
  }

  /**
   * Get recent sessions for user
   */
  async getRecentSessions(limit = 10) {
    const sessions = await this.prisma.conversationHistory.groupBy({
      by: ['sessionId'],
      where: {
        userId: this.userId,
      },
      _max: {
        timestamp: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _max: {
          timestamp: 'desc',
        },
      },
      take: limit,
    });

    return sessions.map(s => ({
      sessionId: s.sessionId,
      lastActive: s._max.timestamp,
      messageCount: s._count.id,
    }));
  }

  /**
   * Load specific session
   */
  async loadSession(sessionId) {
    this.currentSessionId = sessionId;
    return await this.getHistory();
  }

  /**
   * Search conversations
   */
  async searchConversations(query, limit = 20) {
    const messages = await this.prisma.conversationHistory.findMany({
      where: {
        userId: this.userId,
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { agentName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return messages;
  }

  /**
   * Format conversation for Claude API (user + assistant messages only)
   */
  async formatForClaude(limit = 20) {
    const history = await this.getHistory(limit);

    return history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  }

  /**
   * Add file reference to a conversation message
   */
  async addFileReference(messageId, fileData) {
    const fileRef = await this.prisma.conversationFile.create({
      data: {
        conversationId: messageId,
        fileId: fileData.id,
        filename: fileData.filename,
        filepath: fileData.filepath,
        mimetype: fileData.mimetype,
        size: fileData.size,
        extractedText: fileData.extractedText || null,
      },
    });

    return fileRef;
  }

  /**
   * Get files from conversation
   */
  async getConversationFiles(sessionId = null) {
    const sid = sessionId || this.currentSessionId;

    const files = await this.prisma.conversationFile.findMany({
      where: {
        conversation: {
          sessionId: sid,
        },
      },
      include: {
        conversation: true,
      },
    });

    return files;
  }

  /**
   * Delete old conversations (cleanup)
   */
  async deleteOldConversations(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await this.prisma.conversationHistory.deleteMany({
      where: {
        userId: this.userId,
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return deleted.count;
  }
}

module.exports = { ConversationManager };
