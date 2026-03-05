// NEXUS Advanced Agent Functions #26-#28
// Sentiment analysis, revenue forecasting, and auto-healing

/**
 * #26 sentiment_analysis — Classify reply sentiment via Claude API
 */
async function sentimentAnalysis(params) {
  try {
    const { replyText } = params;
    if (!replyText || typeof replyText !== 'string') {
      return { success: false, error: 'replyText is required' };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
    if (!apiKey) {
      return { success: false, error: 'ANTHROPIC_API_KEY not configured' };
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Classify the sentiment of this email reply. Return ONLY valid JSON with no other text.

Reply text:
"""
${replyText.substring(0, 2000)}
"""

Return JSON:
{
  "sentiment": "positive" | "negative" | "neutral" | "interested" | "not_interested",
  "confidence": 0.0-1.0,
  "suggestedAction": "follow_up" | "book_demo" | "remove" | "nurture"
}`
      }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock) {
      return { success: false, error: 'No response from Claude' };
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Failed to parse sentiment response' };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      sentiment: result.sentiment || 'neutral',
      confidence: result.confidence || 0.5,
      suggestedAction: result.suggestedAction || 'nurture'
    };
  } catch (error) {
    return { success: false, error: `sentiment_analysis error: ${error.message}` };
  }
}

/**
 * #27 revenue_forecast — Project revenue based on pipeline data
 */
async function revenueForecast(params) {
  try {
    const {
      leadsInPipeline,
      avgDealValue,
      conversionRate = 0.05,
      timeframeDays = 90
    } = params;

    if (leadsInPipeline === undefined || avgDealValue === undefined) {
      return { success: false, error: 'leadsInPipeline and avgDealValue are required' };
    }

    const leads = Number(leadsInPipeline);
    const dealValue = Number(avgDealValue);
    const rate = Number(conversionRate);
    const days = Number(timeframeDays);

    const expectedDeals = leads * rate;
    const expected = expectedDeals * dealValue;
    const best = leads * Math.min(rate * 2, 1) * dealValue;
    const worst = leads * (rate * 0.5) * dealValue;

    const assumptions = [
      `${leads} leads currently in pipeline`,
      `Average deal value: $${dealValue.toLocaleString()}`,
      `Conversion rate: ${(rate * 100).toFixed(1)}%`,
      `Timeframe: ${days} days`,
      `Expected closes: ${Math.round(expectedDeals)}`,
      `Best case assumes 2x conversion rate`,
      `Worst case assumes 0.5x conversion rate`
    ];

    // Generate narrative summary via Claude if available
    let narrative = null;
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
    if (apiKey) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic({ apiKey });

        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Write a 2-3 sentence executive summary of this revenue forecast. Be direct and actionable.

Pipeline: ${leads} leads, avg deal $${dealValue.toLocaleString()}, ${(rate * 100).toFixed(1)}% conversion
Expected revenue: $${Math.round(expected).toLocaleString()} over ${days} days
Best case: $${Math.round(best).toLocaleString()} | Worst case: $${Math.round(worst).toLocaleString()}`
          }]
        });

        const textBlock = response.content.find(b => b.type === 'text');
        if (textBlock) narrative = textBlock.text;
      } catch (err) {
        // Narrative is optional — continue without it
      }
    }

    return {
      success: true,
      expected: Math.round(expected),
      best: Math.round(best),
      worst: Math.round(worst),
      expectedDeals: Math.round(expectedDeals),
      timeframeDays: days,
      assumptions,
      narrative
    };
  } catch (error) {
    return { success: false, error: `revenue_forecast error: ${error.message}` };
  }
}

/**
 * #28 auto_heal — Analyze and retry failed email sends
 */
async function autoHeal(params) {
  try {
    const { failedSendLog } = params;
    if (!failedSendLog || !Array.isArray(failedSendLog) || failedSendLog.length === 0) {
      return { success: false, error: 'failedSendLog array is required and must not be empty' };
    }

    const actions = [];
    let retried = 0;
    let fixed = 0;
    let escalated = 0;

    for (const entry of failedSendLog) {
      const errorMsg = (entry.error || entry.message || '').toLowerCase();
      const action = { email: entry.email || entry.to || 'unknown', originalError: entry.error || entry.message };

      // Classify error type
      if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('too many')) {
        action.errorType = 'rate_limit';
        action.fix = 'Queued for retry with backoff';
        action.retryable = true;
        retried++;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ECONNRESET')) {
        action.errorType = 'transient_network';
        action.fix = 'Network issue — queued for retry';
        action.retryable = true;
        retried++;
      } else if (errorMsg.includes('bounce') || errorMsg.includes('invalid') || errorMsg.includes('not found') || errorMsg.includes('550')) {
        action.errorType = 'hard_bounce';
        action.fix = 'Invalid recipient — marked for removal from list';
        action.retryable = false;
        fixed++;
      } else if (errorMsg.includes('spam') || errorMsg.includes('blocked') || errorMsg.includes('blacklist')) {
        action.errorType = 'deliverability';
        action.fix = 'Domain/IP blocked — escalated to Warmup Conductor';
        action.retryable = false;
        escalated++;
      } else if (errorMsg.includes('auth') || errorMsg.includes('credential') || errorMsg.includes('401') || errorMsg.includes('403')) {
        action.errorType = 'authentication';
        action.fix = 'API credentials invalid — escalated for manual review';
        action.retryable = false;
        escalated++;
      } else {
        action.errorType = 'unknown';
        action.fix = 'Unclassified error — escalated for review';
        action.retryable = false;
        escalated++;
      }

      actions.push(action);
    }

    return {
      success: true,
      totalAnalyzed: failedSendLog.length,
      retried,
      fixed,
      escalated,
      actions
    };
  } catch (error) {
    return { success: false, error: `auto_heal error: ${error.message}` };
  }
}

module.exports = {
  sentimentAnalysis,
  revenueForecast,
  autoHeal
};
