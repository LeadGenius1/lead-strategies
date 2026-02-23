const OpenAI = require('openai');

/**
 * Perplexity Agent
 * Real-time research with citations
 */
class PerplexityAgent {
  constructor() {
    this.name = 'Perplexity Agent';
    this.client = null; // Lazy init
    this.capabilities = [
      'real_time_research',
      'market_intelligence',
      'competitor_analysis',
      'industry_trends',
    ];
  }

  _getClient() {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: 'https://api.perplexity.ai',
      });
    }
    return this.client;
  }

  /**
   * Research query with real-time data
   */
  async research(query, options = {}) {
    try {
      const response = await this._getClient().chat.completions.create({
        model: options.model || 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide accurate, cited information from recent sources.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.2,
        max_tokens: options.maxTokens || 1000,
      });

      const answer = response.choices[0].message.content;
      const citations = this.extractCitations(answer);

      return {
        success: true,
        query,
        answer,
        citations,
        model: response.model,
        usage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Perplexity research error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Market intelligence research
   */
  async getMarketIntelligence(topic, timeframe = 'last 6 months') {
    const query = `What are the latest developments in ${topic} (${timeframe})? Include market size, key trends, and major players. Provide citations.`;
    return await this.research(query, { maxTokens: 1500 });
  }

  /**
   * Competitor analysis
   */
  async analyzeCompetitor(competitorName, aspects = []) {
    const aspectsStr = aspects.length > 0
      ? `Focus on: ${aspects.join(', ')}`
      : 'Focus on: pricing, features, market position, recent news';

    const query = `Analyze ${competitorName} as a company. ${aspectsStr}. Provide recent information with citations.`;
    return await this.research(query, { maxTokens: 2000 });
  }

  /**
   * Industry trend analysis
   */
  async analyzeTrends(industry, timeframe = 'last 3 months') {
    const query = `What are the key trends in the ${industry} industry (${timeframe})? Include statistics, emerging patterns, and expert opinions. Cite sources.`;
    return await this.research(query, { maxTokens: 1500 });
  }

  /**
   * Extract citations from response
   */
  extractCitations(text) {
    const citationPattern = /\[(\d+)\]/g;
    const citations = text.match(citationPattern) || [];
    return Array.from(new Set(citations));
  }
}

module.exports = { PerplexityAgent };
