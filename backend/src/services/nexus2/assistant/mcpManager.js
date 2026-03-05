// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — MCP CONNECTION MANAGER
// Manages provider connections and dispatches tool calls.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../config/database');
const { getProvider, PROVIDERS } = require('./mcpRegistry');

/**
 * Connect a provider for a user.
 */
async function connectProvider(userId, providerId, config) {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  // Validate required config fields
  for (const field of provider.requiredConfig) {
    if (!config[field]) {
      throw new Error(`Missing required config field: ${field}`);
    }
  }

  // Test connection (provider-specific)
  await testConnection(providerId, config);

  // Upsert connection
  const connection = await prisma.mCPConnection.upsert({
    where: {
      userId_provider: { userId, provider: providerId },
    },
    update: {
      name: provider.name,
      config,
      status: 'active',
      updatedAt: new Date(),
    },
    create: {
      userId,
      provider: providerId,
      name: provider.name,
      config,
      status: 'active',
    },
  });

  return connection;
}

/**
 * Disconnect a provider.
 */
async function disconnectProvider(userId, connectionId) {
  const connection = await prisma.mCPConnection.findFirst({
    where: { id: connectionId, userId },
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  await prisma.mCPConnection.update({
    where: { id: connectionId },
    data: { status: 'disconnected' },
  });

  return { disconnected: true };
}

/**
 * Get all active connections for a user.
 */
async function getConnections(userId) {
  return prisma.mCPConnection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      provider: true,
      name: true,
      status: true,
      lastUsed: true,
      createdAt: true,
    },
  });
}

/**
 * Execute a provider tool for a user.
 */
async function executeProviderTool(userId, providerId, toolName, input) {
  const connection = await prisma.mCPConnection.findFirst({
    where: { userId, provider: providerId, status: 'active' },
  });

  if (!connection) {
    throw new Error(`No active ${providerId} connection. Connect it in Settings > Integrations.`);
  }

  // Update lastUsed
  await prisma.mCPConnection.update({
    where: { id: connection.id },
    data: { lastUsed: new Date() },
  });

  // Dispatch to provider handler
  switch (providerId) {
    case 'instantly':
      return await handleInstantly(connection.config, toolName, input);

    case 'google_sheets':
      return await handleGoogleSheets(connection.config, toolName, input);

    case 'hubspot':
      return await handleHubSpot(connection.config, toolName, input);

    default:
      throw new Error(`Provider ${providerId} has no handler`);
  }
}

// ─── Provider Handlers ──────────────────────────────────

async function testConnection(providerId, config) {
  switch (providerId) {
    case 'instantly': {
      // Quick validation — check if API key format looks right
      if (!config.apiKey || config.apiKey.length < 10) {
        throw new Error('Invalid Instantly API key');
      }
      return true;
    }

    case 'google_sheets': {
      if (!config.accessToken) {
        throw new Error('Google Sheets access token required');
      }
      return true;
    }

    case 'hubspot': {
      if (!config.apiKey || config.apiKey.length < 10) {
        throw new Error('Invalid HubSpot API key');
      }
      return true;
    }

    default:
      return true;
  }
}

async function handleInstantly(config, toolName, input) {
  // Reuse existing Instantly service
  let instantlyService = null;
  try {
    instantlyService = require('../../instantly');
  } catch {
    return { error: 'Instantly service not available' };
  }

  switch (toolName) {
    case 'list_campaigns':
      return await instantlyService.getCampaigns();
    case 'get_analytics':
      if (!input.campaignId) return { error: 'campaignId required' };
      return await instantlyService.getCampaignAnalytics(input.campaignId);
    case 'list_leads':
      return { message: 'Lead listing via MCP — coming soon' };
    case 'add_leads':
      return { message: 'Lead addition via MCP — coming soon' };
    default:
      return { error: `Unknown Instantly action: ${toolName}` };
  }
}

async function handleGoogleSheets(config, toolName, input) {
  // Placeholder — Google Sheets integration
  return { message: `Google Sheets ${toolName} — integration coming soon`, input };
}

async function handleHubSpot(config, toolName, input) {
  // Placeholder — HubSpot integration
  return { message: `HubSpot ${toolName} — integration coming soon`, input };
}

module.exports = {
  connectProvider,
  disconnectProvider,
  getConnections,
  executeProviderTool,
};
