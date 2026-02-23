const FirecrawlApp = require('@mendable/firecrawl-js').default || require('@mendable/firecrawl-js');

/**
 * Firecrawl Agent
 * Web scraping and competitive intelligence
 */
class FirecrawlAgent {
  constructor() {
    this.name = 'Firecrawl Agent';
    this.client = null; // Lazy init
    this.capabilities = [
      'scrape_website',
      'extract_structured_data',
      'monitor_competitor_pricing',
      'research_company_info',
    ];
  }

  _getClient() {
    if (!this.client) {
      this.client = new FirecrawlApp({
        apiKey: process.env.FIRECRAWL_API_KEY,
      });
    }
    return this.client;
  }

  /**
   * Scrape a single webpage
   */
  async scrapePage(url, options = {}) {
    try {
      const result = await this._getClient().scrape(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: options.mainContentOnly !== false,
        includeTags: options.includeTags || [],
        excludeTags: options.excludeTags || ['nav', 'footer', 'script'],
      });

      return {
        success: true,
        url,
        title: result.metadata?.title || 'Unknown',
        content: result.markdown || result.html,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('Firecrawl scrape error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Scrape competitor pricing page
   */
  async scrapeCompetitorPricing(competitorName, url) {
    const result = await this.scrapePage(url, {
      includeTags: ['pricing', 'price', 'plan', 'tier'],
    });

    if (!result.success) {
      return result;
    }

    const pricingPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    const prices = result.content.match(pricingPattern) || [];

    return {
      success: true,
      competitor: competitorName,
      url,
      prices: prices.map(p => p.replace(/,/g, '')),
      rawContent: result.content,
      scrapedAt: new Date().toISOString(),
    };
  }

  /**
   * Research company information
   */
  async researchCompany(domain) {
    const aboutUrl = `https://${domain}/about`;
    const result = await this.scrapePage(aboutUrl);

    if (!result.success) {
      return await this.scrapePage(`https://${domain}`);
    }

    return result;
  }

  /**
   * Crawl multiple pages (site map)
   */
  async crawlSite(url, maxPages = 10) {
    try {
      const result = await this._getClient().crawl(url, {
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown'],
        },
      });

      return {
        success: true,
        url,
        pages: result.data || [],
        totalPages: result.data?.length || 0,
      };
    } catch (error) {
      console.error('Firecrawl crawl error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = { FirecrawlAgent };
