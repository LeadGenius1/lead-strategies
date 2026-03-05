// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT TOOL DEFINITIONS
// 12 Anthropic tool_use format tools for the cockpit assistant.
// ═══════════════════════════════════════════════════════════════

const tools = [
  {
    name: 'adjust_schedule',
    description:
      'Adjust the autonomous schedule — change frequency, enable/disable tasks, or update timing. Use when the user wants to change how often tasks run.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description:
            'Task to adjust: sender-health, competitor-watch, content-generator, prospect-finder, strategy-refresh, performance-report, market-intel-refresh',
        },
        action: {
          type: 'string',
          enum: ['pause', 'resume', 'update-frequency'],
          description: 'What to do with the task',
        },
        frequency: {
          type: 'string',
          enum: ['daily', '3x/week', 'weekly'],
          description: 'New frequency (only for update-frequency action)',
        },
      },
      required: ['taskId', 'action'],
    },
  },
  {
    name: 'trigger_task',
    description:
      'Immediately run a scheduled task right now instead of waiting for its next cron run. Use when the user says "run X now" or "generate content now".',
    input_schema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description:
            'Task to trigger: sender-health, competitor-watch, content-generator, prospect-finder, strategy-refresh, performance-report, market-intel-refresh',
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'pause_task',
    description:
      'Pause a scheduled task so it stops running on its cron schedule. The task can be resumed later.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task to pause' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'resume_task',
    description:
      'Resume a previously paused task so it starts running on its cron schedule again.',
    input_schema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task to resume' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'generate_content',
    description:
      'Generate marketing content — emails, social posts, ad copy, blog outlines. Use when the user asks to write or draft something.',
    input_schema: {
      type: 'object',
      properties: {
        contentType: {
          type: 'string',
          enum: ['email', 'social-post', 'ad-copy', 'blog-outline', 'sms'],
          description: 'Type of content to generate',
        },
        topic: {
          type: 'string',
          description: 'Topic or subject for the content',
        },
        platform: {
          type: 'string',
          enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'email', 'sms'],
          description: 'Target platform (for social posts)',
        },
        tone: {
          type: 'string',
          description: 'Tone override (defaults to profile toneOfVoice)',
        },
      },
      required: ['contentType', 'topic'],
    },
  },
  {
    name: 'manage_campaign',
    description:
      'Create, launch, pause, or get info about email campaigns via Instantly. Use for any campaign management request.',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'launch', 'pause', 'list', 'analytics'],
          description: 'Campaign action to take',
        },
        campaignId: {
          type: 'string',
          description: 'Campaign ID (required for launch/pause/analytics)',
        },
        name: {
          type: 'string',
          description: 'Campaign name (for create)',
        },
        subject: {
          type: 'string',
          description: 'Email subject line (for create)',
        },
        body: {
          type: 'string',
          description: 'Email body HTML (for create)',
        },
      },
      required: ['action'],
    },
  },
  {
    name: 'research_topic',
    description:
      'Research a topic using real-time web data with citations. Use for market research, trend analysis, industry questions.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Research query — be specific for better results',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'scan_competitor',
    description:
      'Scrape and analyze a competitor website for pricing, features, positioning. Use when the user asks about a competitor.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Competitor company name',
        },
        url: {
          type: 'string',
          description: 'Competitor website URL',
        },
      },
      required: ['name', 'url'],
    },
  },
  {
    name: 'query_performance',
    description:
      'Get performance metrics — campaign analytics, task run history, cost data. Use when the user asks "how are things going" or wants stats.',
    input_schema: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: ['campaigns', 'tasks', 'costs', 'overview'],
          description: 'Which metrics to retrieve',
        },
        days: {
          type: 'number',
          description: 'Number of days to look back (default 7)',
        },
      },
      required: ['metric'],
    },
  },
  {
    name: 'update_strategy',
    description:
      'Update business profile fields — target market, ICP, competitors, offer, tone. Use when the user says "change my target to..." or "update ICP".',
    input_schema: {
      type: 'object',
      properties: {
        field: {
          type: 'string',
          enum: [
            'targetMarket',
            'icp',
            'competitors',
            'offer',
            'toneOfVoice',
            'contentThemes',
            'uniqueValue',
          ],
          description: 'Profile field to update',
        },
        value: {
          type: 'string',
          description: 'New value (strings for text fields, JSON string for arrays)',
        },
      },
      required: ['field', 'value'],
    },
  },
  {
    name: 'check_platforms',
    description:
      'Check the status and health of connected platforms — email sender warmup, social accounts, integrations.',
    input_schema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['email', 'social', 'all'],
          description: 'Which platform(s) to check',
        },
      },
      required: ['platform'],
    },
  },
  {
    name: 'list_schedule',
    description:
      'Show the current autonomous schedule — which tasks are active, paused, their next run times, and recent results.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_video',
    description:
      'Create a marketing video. Tier "auto" uses AI script + stock footage + voiceover with zero user effort. Tier "personalized" uses user photos + industry template.',
    input_schema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          enum: ['auto', 'personalized'],
          description: 'Video tier: auto (stock footage) or personalized (user photos + template)',
        },
        topic: {
          type: 'string',
          description: 'Topic or subject for the video script',
        },
        templateId: {
          type: 'string',
          description: 'Template ID for personalized tier (e.g. before-after, service-showcase, team-intro)',
        },
        channels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Distribution channels (e.g. instagram, facebook)',
        },
      },
      required: ['topic'],
    },
  },

  // ─── File Analysis ──────────────────────────────────────
  {
    name: 'analyze_file',
    description:
      'Analyze an uploaded file in detail — summarize contents, extract data points, find patterns. Use when the user uploads a file and asks questions about it.',
    input_schema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'The ID of the uploaded file to analyze',
        },
        question: {
          type: 'string',
          description: 'Specific question about the file contents',
        },
      },
      required: ['fileId'],
    },
  },

  // ─── Memory Tools ──────────────────────────────────────
  {
    name: 'save_memory',
    description:
      'Save an important fact to persistent memory — business context, preferences, contacts, decisions. Use proactively when the user shares important information.',
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['preference', 'business', 'contact', 'decision', 'general'],
          description: 'Memory category',
        },
        key: {
          type: 'string',
          description: 'Short key describing this memory (e.g. "preferred_tone", "main_competitor")',
        },
        value: {
          type: 'string',
          description: 'The information to remember',
        },
      },
      required: ['category', 'key', 'value'],
    },
  },
  {
    name: 'recall_memories',
    description:
      'Search persistent memory for relevant information. Use when you need to recall something the user told you before.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query — matches against memory keys and values',
        },
        category: {
          type: 'string',
          enum: ['preference', 'business', 'contact', 'decision', 'general'],
          description: 'Optional category filter',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'forget_memory',
    description:
      'Delete a specific memory. Use when the user asks you to forget something.',
    input_schema: {
      type: 'object',
      properties: {
        memoryId: {
          type: 'string',
          description: 'The ID of the memory to delete',
        },
      },
      required: ['memoryId'],
    },
  },

  // ─── Integration Tools ─────────────────────────────────
  {
    name: 'list_integrations',
    description:
      'List the user\'s connected integrations (Instantly, Google Sheets, HubSpot, etc.) and their status.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'use_integration',
    description:
      'Execute an action through a connected integration. Use when the user wants to interact with an external service.',
    input_schema: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          description: 'Integration provider ID (e.g. "instantly", "google_sheets", "hubspot")',
        },
        action: {
          type: 'string',
          description: 'Action to perform (provider-specific)',
        },
        params: {
          type: 'object',
          description: 'Parameters for the action',
        },
      },
      required: ['provider', 'action'],
    },
  },
];

module.exports = { tools };
