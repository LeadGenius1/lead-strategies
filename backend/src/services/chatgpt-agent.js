const OpenAI = require('openai');

/**
 * ChatGPT Agent
 * Cost-optimized bulk operations
 */
class ChatGPTAgent {
  constructor() {
    this.name = 'ChatGPT Agent';
    this.client = null; // Lazy init
    this.capabilities = [
      'bulk_email_generation',
      'ab_test_variants',
      'content_summarization',
      'simple_classification',
    ];
    this.defaultModel = 'gpt-4o-mini';
  }

  _getClient() {
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    return this.client;
  }

  /**
   * Generate email content (single)
   */
  async generateEmail(recipient, context, options = {}) {
    try {
      const prompt = `Write a ${options.tone || 'professional'} email to ${recipient.name || 'the recipient'}.

Context:
- Company: ${recipient.company || 'Unknown'}
- Role: ${recipient.title || 'Unknown'}
- Objective: ${context.objective || 'General outreach'}
- Key Points: ${context.keyPoints?.join(', ') || 'N/A'}

Email should be:
- Personalized and relevant
- ${options.length || 'Medium'} length (${options.length === 'short' ? '50-100' : '150-250'} words)
- Include clear call-to-action
- Professional tone

Write ONLY the email body, no subject line.`;

      const response = await this._getClient().chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an expert email copywriter.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return {
        success: true,
        email: response.choices[0].message.content,
        usage: response.usage,
        cost: this.calculateCost(response.usage, this.defaultModel),
      };
    } catch (error) {
      console.error('ChatGPT email generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate A/B test variants (bulk)
   */
  async generateVariants(baseContent, count = 3, variationType = 'subject_line') {
    try {
      const prompt = variationType === 'subject_line'
        ? `Generate ${count} different subject line variants for this email:\n\n${baseContent}\n\nVariants should:\n- Test different hooks\n- Maintain professionalism\n- Be under 60 characters\n\nReturn as JSON array: ["variant1", "variant2", ...]`
        : `Generate ${count} different email body variants for:\n\n${baseContent}\n\nVariants should:\n- Test different angles\n- Maintain core message\n- Vary structure and tone\n\nReturn as JSON array.`;

      const response = await this._getClient().chat.completions.create({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: 'You are an A/B testing expert. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      const content = response.choices[0].message.content;
      const variants = JSON.parse(content);

      return {
        success: true,
        variants,
        count: variants.length,
        usage: response.usage,
        cost: this.calculateCost(response.usage, this.defaultModel),
      };
    } catch (error) {
      console.error('ChatGPT variant generation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Bulk summarization
   */
  async summarizeBulk(texts, maxLength = 100) {
    const summaries = [];

    for (const text of texts) {
      try {
        const response = await this._getClient().chat.completions.create({
          model: this.defaultModel,
          messages: [
            { role: 'system', content: `Summarize in ${maxLength} words or less.` },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          max_tokens: Math.ceil(maxLength * 1.5),
        });

        summaries.push({
          original: text.substring(0, 100) + '...',
          summary: response.choices[0].message.content,
        });
      } catch (error) {
        summaries.push({
          original: text.substring(0, 100) + '...',
          error: error.message,
        });
      }
    }

    return {
      success: true,
      summaries,
      totalProcessed: summaries.length,
    };
  }

  /**
   * Simple classification
   */
  async classify(text, categories) {
    try {
      const response = await this._getClient().chat.completions.create({
        model: this.defaultModel,
        messages: [
          {
            role: 'system',
            content: `Classify the text into one of these categories: ${categories.join(', ')}. Return ONLY the category name.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const category = response.choices[0].message.content.trim();

      return {
        success: true,
        category,
        text: text.substring(0, 100) + '...',
      };
    } catch (error) {
      console.error('ChatGPT classification error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate API cost
   */
  calculateCost(usage, model) {
    const pricing = {
      'gpt-4o-mini': { input: 0.15 / 1000000, output: 0.60 / 1000000 },
      'gpt-4o': { input: 2.50 / 1000000, output: 10.00 / 1000000 },
    };

    const rates = pricing[model] || pricing['gpt-4o-mini'];
    const cost = (usage.prompt_tokens * rates.input) + (usage.completion_tokens * rates.output);

    return {
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      costUSD: cost.toFixed(6),
    };
  }
}

module.exports = { ChatGPTAgent };
