const { MCPClientManager } = require('./mcp-client-manager');
const { ConversationManager } = require('./conversation-manager');
const { AGENT_CAPABILITIES, findAgentByCapability, canAutoExecute } = require('./agent-registry');

/**
 * NEXUS Orchestrator
 * Delegates tasks to appropriate agents
 * Manages agent workflow and conversation context
 */
class NexusOrchestrator {
  constructor(prisma, userId) {
    this.prisma = prisma;
    this.userId = userId;
    this.mcpManager = null;
    this.conversationManager = null;
    this.initialized = false;
  }

  /**
   * Initialize orchestrator
   */
  async initialize(sessionId = null) {
    if (this.initialized) return;

    // Initialize MCP clients
    this.mcpManager = new MCPClientManager();
    await this.mcpManager.initialize();

    // Initialize conversation manager with shared Prisma
    this.conversationManager = new ConversationManager(this.prisma, this.userId);
    await this.conversationManager.initializeSession(sessionId);

    this.initialized = true;
  }

  /**
   * Delegate task to appropriate agent
   */
  async delegate(task, params = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const agent = findAgentByCapability(task);

    if (!agent) {
      return {
        success: false,
        error: `No agent found for task: ${task}`,
      };
    }

    // Log delegation
    await this.conversationManager.addMessage({
      role: 'system',
      content: `Delegating ${task} to ${agent.name}`,
      agentName: agent.id,
      agentAction: task,
      metadata: { params, autonomy: agent.tier },
    });

    try {
      const client = this.mcpManager.getClient(agent.id);

      if (!client) {
        return {
          success: false,
          error: `Agent ${agent.id} not available (no MCP client)`,
          agent: agent.id,
        };
      }

      const result = await this.executeAgentTask(client, task, params);

      // Log result
      await this.conversationManager.addMessage({
        role: 'tool',
        content: JSON.stringify(result),
        agentName: agent.id,
        agentAction: task,
      });

      return result;
    } catch (error) {
      console.error(`Agent ${agent.id} error:`, error);
      return {
        success: false,
        error: error.message,
        agent: agent.id,
      };
    }
  }

  /**
   * Execute agent task
   */
  async executeAgentTask(agent, task, params) {
    const taskMethods = {
      // Firecrawl
      'scrape_website': () => agent.scrapePage(params.url, params.options),
      'monitor_competitor_pricing': () => agent.scrapeCompetitorPricing(params.name, params.url),
      'research_company_info': () => agent.researchCompany(params.domain),

      // Perplexity
      'real_time_research': () => agent.research(params.query, params.options),
      'market_intelligence': () => agent.getMarketIntelligence(params.topic, params.timeframe),
      'competitor_analysis': () => agent.analyzeCompetitor(params.name, params.aspects),
      'industry_trends': () => agent.analyzeTrends(params.industry, params.timeframe),

      // ChatGPT
      'bulk_email_generation': () => agent.generateEmail(params.recipient, params.context, params.options),
      'ab_test_variants': () => agent.generateVariants(params.content, params.count, params.type),
      'content_summarization': () => agent.summarizeBulk(params.texts, params.maxLength),
      'simple_classification': () => agent.classify(params.text, params.categories),
    };

    const method = taskMethods[task];
    if (!method) {
      throw new Error(`Task ${task} not implemented for agent`);
    }

    return await method();
  }

  /**
   * Process user message
   */
  async processMessage(userMessage) {
    // Add user message to history
    await this.conversationManager.addMessage({
      role: 'user',
      content: userMessage,
    });

    // Detect intent
    const intent = this.detectIntent(userMessage);

    // Route to appropriate workflow
    switch (intent.type) {
      case 'research':
        return await this.handleResearchRequest(intent);
      case 'scrape':
        return await this.handleScrapeRequest(intent);
      case 'analyze':
        return await this.handleAnalysisRequest(intent);
      default:
        return await this.handleGeneralQuery(userMessage);
    }
  }

  /**
   * Detect user intent
   */
  detectIntent(message) {
    const lower = message.toLowerCase();

    if (lower.includes('research') || lower.includes('find out') || lower.includes('what are')) {
      return { type: 'research', message };
    }
    if (lower.includes('scrape') || lower.includes('competitor') || lower.includes('pricing')) {
      return { type: 'scrape', message };
    }
    if (lower.includes('analyze') || lower.includes('trends') || lower.includes('market')) {
      return { type: 'analyze', message };
    }

    return { type: 'general', message };
  }

  /**
   * Handle research request
   */
  async handleResearchRequest(intent) {
    const result = await this.delegate('real_time_research', {
      query: intent.message,
    });

    const response = result.success
      ? `Research Results:\n\n${result.answer}\n\nCitations: ${result.citations?.join(', ') || 'N/A'}`
      : `Research failed: ${result.error}`;

    await this.conversationManager.addMessage({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  /**
   * Handle scrape request
   */
  async handleScrapeRequest(intent) {
    const urlMatch = intent.message.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    if (!url) {
      const response = 'Please provide a URL to scrape.';
      await this.conversationManager.addMessage({ role: 'assistant', content: response });
      return response;
    }

    const result = await this.delegate('scrape_website', { url });

    const response = result.success
      ? `Scraped ${result.title}\n\n${result.content.substring(0, 500)}...`
      : `Scrape failed: ${result.error}`;

    await this.conversationManager.addMessage({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  /**
   * Handle analysis request
   */
  async handleAnalysisRequest(intent) {
    const result = await this.delegate('market_intelligence', {
      topic: intent.message,
    });

    const response = result.success
      ? `Market Analysis:\n\n${result.answer}`
      : `Analysis failed: ${result.error}`;

    await this.conversationManager.addMessage({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  /**
   * Handle general query
   */
  async handleGeneralQuery(message) {
    const response = `I'm NEXUS, your autonomous operations assistant. I can help with:

- Research: "Research AI agent market trends"
- Scraping: "Scrape https://competitor.com/pricing"
- Analysis: "Analyze sales automation industry"
- File uploads: Upload docs, PDFs, images for analysis

What would you like me to do?`;

    await this.conversationManager.addMessage({
      role: 'assistant',
      content: response,
    });

    return response;
  }

  /**
   * Get conversation history
   */
  async getHistory(limit = 50) {
    return await this.conversationManager.getHistory(limit);
  }

  /**
   * Get formatted history for Claude API
   */
  async getFormattedHistory(limit = 20) {
    return await this.conversationManager.formatForClaude(limit);
  }
}

module.exports = { NexusOrchestrator };
