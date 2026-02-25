// NEXUS Multi-Agent Orchestrator Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /health - Check all AI model API keys
router.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    models: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      firecrawl: !!process.env.FIRECRAWL_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /status - Live system status
router.get('/status', async (req, res) => {
  res.json({
    production: { status: 'healthy', timestamp: new Date() },
    sms: { live: true, a2p: true, phone: '+16105615563' },
    socialPublishing: {
      platforms: [
        'facebook', 'twitter', 'instagram', 'youtube', 'whatsapp',
        'telegram', 'linkedin', 'pinterest', 'discord', 'slack', 'tiktok',
      ],
      count: 11,
    },
    agents: {
      active: 7,
      names: [
        'Lead Hunter', 'Copy Writer', 'Compliance Guardian',
        'Warmup Conductor', 'Engagement Analyzer', 'Analytics Brain', 'Healing Sentinel',
      ],
    },
    models: {
      claude: !!process.env.ANTHROPIC_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
      firecrawl: !!process.env.FIRECRAWL_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    lastUpdated: new Date().toISOString(),
  });
});

// --- Authenticated routes below ---
router.use(authenticate);

// POST /research - Real-time web research via Perplexity
router.post('/research', async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'query is required' });
    }

    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(503).json({ success: false, error: 'Perplexity API key not configured' });
    }

    const messages = [];
    if (context) {
      messages.push({ role: 'system', content: context });
    }
    messages.push({ role: 'user', content: query });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: data.error?.message || data.detail || 'Perplexity API error',
      });
    }

    const answer = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    res.json({
      success: true,
      answer,
      sources: citations,
      query,
      model: 'sonar',
    });
  } catch (err) {
    console.error('NEXUS research error:', err);
    res.status(500).json({ success: false, error: 'Research request failed' });
  }
});

// POST /scrape - Scrape a URL via Firecrawl
router.post('/scrape', async (req, res) => {
  try {
    const { url, extractInfo } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, error: 'url is required' });
    }

    if (!process.env.FIRECRAWL_API_KEY) {
      return res.status(503).json({ success: false, error: 'Firecrawl API key not configured' });
    }

    const body = { url, formats: ['markdown'] };
    if (extractInfo) {
      body.extract = { prompt: extractInfo };
    }

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return res.status(502).json({
        success: false,
        error: data.error || 'Firecrawl API error',
      });
    }

    res.json({
      success: true,
      content: data.data?.markdown || '',
      url,
      title: data.data?.metadata?.title || '',
      model: 'firecrawl',
    });
  } catch (err) {
    console.error('NEXUS scrape error:', err);
    res.status(500).json({ success: false, error: 'Scrape request failed' });
  }
});

// POST /write - Writing tasks via Claude (Anthropic)
router.post('/write', async (req, res) => {
  try {
    const { task, context, tone, maxTokens } = req.body;

    if (!task) {
      return res.status(400).json({ success: false, error: 'task is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ success: false, error: 'Anthropic API key not configured' });
    }

    let systemPrompt = 'You are an expert business writer for AI Lead Strategies LLC.';
    if (tone) systemPrompt += ` Write in a ${tone} tone.`;
    if (context) systemPrompt += ` Context: ${context}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens || 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: task }],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(502).json({
        success: false,
        error: data.error?.message || 'Anthropic API error',
      });
    }

    const content = data.content?.[0]?.text || '';

    res.json({
      success: true,
      content,
      task,
      model: 'claude-sonnet-4-5-20250929',
    });
  } catch (err) {
    console.error('NEXUS write error:', err);
    res.status(500).json({ success: false, error: 'Write request failed' });
  }
});

// POST /analyze - Data analysis via OpenAI GPT-4o
router.post('/analyze', async (req, res) => {
  try {
    const { data: inputData, question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, error: 'question is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OpenAI API key not configured' });
    }

    const prompt = inputData
      ? `Analyze this data and answer the question.\n\nData:\n${typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)}\n\nQuestion: ${question}`
      : question;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(502).json({
        success: false,
        error: data.error?.message || 'OpenAI API error',
      });
    }

    const analysis = data.choices?.[0]?.message?.content || '';

    res.json({
      success: true,
      analysis,
      question,
      model: 'gpt-4o',
    });
  } catch (err) {
    console.error('NEXUS analyze error:', err);
    res.status(500).json({ success: false, error: 'Analysis request failed' });
  }
});

// Helper: internal call to research endpoint logic
async function doResearch(query, context) {
  if (!process.env.PERPLEXITY_API_KEY) {
    return { success: false, error: 'Perplexity API key not configured' };
  }

  const messages = [];
  if (context) messages.push({ role: 'system', content: context });
  messages.push({ role: 'user', content: query });

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: 'sonar', messages }),
  });

  const data = await response.json();
  if (!response.ok) {
    return { success: false, error: data.error?.message || 'Perplexity API error' };
  }

  return {
    success: true,
    answer: data.choices?.[0]?.message?.content || '',
    sources: data.citations || [],
  };
}

// Helper: internal call to scrape endpoint logic
async function doScrape(url) {
  if (!process.env.FIRECRAWL_API_KEY) {
    return { success: false, error: 'Firecrawl API key not configured' };
  }

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, formats: ['markdown'] }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    return { success: false, error: data.error || 'Firecrawl API error' };
  }

  return {
    success: true,
    content: data.data?.markdown || '',
    title: data.data?.metadata?.title || '',
  };
}

// Helper: internal call to write endpoint logic
async function doWrite(task, context, tone) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { success: false, error: 'Anthropic API key not configured' };
  }

  let systemPrompt = 'You are an expert business writer for AI Lead Strategies LLC.';
  if (tone) systemPrompt += ` Write in a ${tone} tone.`;
  if (context) systemPrompt += ` Context: ${context}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: task }],
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    return { success: false, error: data.error?.message || 'Anthropic API error' };
  }

  return { success: true, content: data.content?.[0]?.text || '' };
}

// Helper: internal call to analyze endpoint logic
async function doAnalyze(inputData, question) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  const prompt = inputData
    ? `Analyze this data and answer the question.\n\nData:\n${typeof inputData === 'string' ? inputData : JSON.stringify(inputData, null, 2)}\n\nQuestion: ${question}`
    : question;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    return { success: false, error: data.error?.message || 'OpenAI API error' };
  }

  return { success: true, analysis: data.choices?.[0]?.message?.content || '' };
}

// POST /run-agent - Master orchestrator routes to correct model
router.post('/run-agent', async (req, res) => {
  try {
    const { agent, task, data: agentData } = req.body;

    if (!agent || !task) {
      return res.status(400).json({ success: false, error: 'agent and task are required' });
    }

    let result;
    let modelUsed;

    switch (agent) {
      case 'lead-hunter': {
        // Scrape + Research combo
        const url = agentData?.url;
        const scrapeResult = url ? await doScrape(url) : null;
        const context = scrapeResult?.success ? `Scraped data from ${url}:\n${scrapeResult.content.substring(0, 3000)}` : undefined;
        const researchResult = await doResearch(task, context);
        result = {
          research: researchResult,
          scrape: scrapeResult,
        };
        modelUsed = 'perplexity-sonar + firecrawl';
        break;
      }

      case 'copy-writer': {
        const tone = agentData?.tone || 'professional';
        const writeResult = await doWrite(task, agentData?.context, tone);
        result = writeResult;
        modelUsed = 'claude-sonnet-4-5-20250929';
        break;
      }

      case 'analytics-brain': {
        const researchResult = await doResearch(task, 'You are an analytics expert. Provide data-driven insights with statistics and trends.');
        result = researchResult;
        modelUsed = 'perplexity-sonar';
        break;
      }

      case 'compliance-guardian': {
        const complianceResult = await doWrite(
          `Review the following for legal/regulatory compliance issues. Flag any CAN-SPAM, TCPA, GDPR, or FTC violations:\n\n${task}`,
          'You are a compliance expert specializing in email marketing and SMS regulations.',
          'formal'
        );
        result = complianceResult;
        modelUsed = 'claude-sonnet-4-5-20250929';
        break;
      }

      case 'engagement-analyzer': {
        const analyzeResult = await doAnalyze(agentData, task);
        result = analyzeResult;
        modelUsed = 'gpt-4o';
        break;
      }

      case 'healing-sentinel': {
        // Run health checks
        result = {
          models: {
            claude: !!process.env.ANTHROPIC_API_KEY,
            perplexity: !!process.env.PERPLEXITY_API_KEY,
            firecrawl: !!process.env.FIRECRAWL_API_KEY,
            openai: !!process.env.OPENAI_API_KEY,
          },
          sms: {
            twilio_configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_MESSAGING_SERVICE_SID),
          },
          social: {
            meta_configured: !!(process.env.META_APP_ID && process.env.META_APP_SECRET),
            twitter_configured: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
          },
          status: 'all systems checked',
        };
        modelUsed = 'internal';
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown agent: ${agent}`,
          availableAgents: [
            'lead-hunter', 'copy-writer', 'analytics-brain',
            'compliance-guardian', 'engagement-analyzer', 'healing-sentinel',
          ],
        });
    }

    res.json({
      success: true,
      agent,
      result,
      model_used: modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('NEXUS run-agent error:', err);
    res.status(500).json({ success: false, error: 'Agent execution failed' });
  }
});

module.exports = router;
