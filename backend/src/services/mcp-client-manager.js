const { FirecrawlAgent } = require('./firecrawl-agent');
const { PerplexityAgent } = require('./perplexity-agent');
const { ChatGPTAgent } = require('./chatgpt-agent');

/**
 * MCP Client Manager
 * Manages all MCP connections and research tools
 */
class MCPClientManager {
  constructor() {
    this.clients = {};
    this.initialized = false;
  }

  /**
   * Initialize all MCP clients
   */
  async initialize() {
    if (this.initialized) {
      return this.clients;
    }

    console.log('Initializing MCP clients...');

    try {
      // Research Tools
      this.clients.firecrawl = new FirecrawlAgent();
      this.clients.perplexity = new PerplexityAgent();
      this.clients.chatgpt = new ChatGPTAgent();

      // TODO: Add other MCP clients as needed
      // this.clients.instantly = new InstantlyClient();
      // this.clients.stripe = new StripeClient();
      // this.clients.cloudflare = new CloudflareClient();

      this.initialized = true;
      console.log('MCP clients initialized');

      return this.clients;
    } catch (error) {
      console.error('MCP initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get specific client
   */
  getClient(name) {
    if (!this.initialized) {
      throw new Error('MCP clients not initialized. Call initialize() first.');
    }
    return this.clients[name];
  }

  /**
   * Get all clients
   */
  getAllClients() {
    if (!this.initialized) {
      throw new Error('MCP clients not initialized. Call initialize() first.');
    }
    return this.clients;
  }

  /**
   * Health check for all clients
   */
  async healthCheck() {
    const health = {};

    for (const [name, client] of Object.entries(this.clients)) {
      try {
        const isHealthy = !!client.name;
        health[name] = { healthy: isHealthy, name: client.name };
      } catch (error) {
        health[name] = { healthy: false, error: error.message };
      }
    }

    return health;
  }
}

module.exports = { MCPClientManager };
