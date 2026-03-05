// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — AI ASSISTANT SERVICE
// Core streaming chat orchestration with Claude tool-use loop.
// ═══════════════════════════════════════════════════════════════

const Anthropic = require('@anthropic-ai/sdk');
const { prisma } = require('../../../config/database');
const { tools } = require('./tools');
const { executeTool, truncate } = require('./toolExecutor');
const { profileToMissionInputs } = require('../profileBridge');
const engine = require('../scheduler/engine');
const { trackCost } = require('../../marketStrategy/costTracker');
const crypto = require('crypto');

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOOL_ROUNDS = 5;
const MAX_HISTORY = 20;
const AGENT_NAME = 'lead-hunter';

let anthropic = null;

function getClient() {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
    anthropic = new Anthropic({ apiKey });
  }
  return anthropic;
}

// ─── SSE Helpers ──────────────────────────────────────────

function sseWrite(res, event, data) {
  if (res.writableEnded) return;
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
}

// ─── System Prompt Builder ────────────────────────────────

async function buildSystemPrompt(userId) {
  const parts = [
    'You are Lead Hunter, the AI marketing partner and co-founder for this business.',
    'Speak in first person: "I found...", "I drafted...", "I recommend..." — partner tone.',
    'Be direct and action-oriented. 1-3 sentences for actions, more for strategy.',
    'No preamble, no "Sure!", no "Great question!" — just answer.',
    'When you use a tool, briefly say what you did and the result.',
    'If data is available, cite numbers. If not, say so.',
    '',
  ];

  // Load business profile for context
  try {
    const profile = await prisma.businessProfile.findUnique({ where: { userId } });
    if (profile) {
      const ctx = profileToMissionInputs(profile);
      parts.push('--- BUSINESS CONTEXT ---');
      parts.push(`Business: ${ctx.enrichedContext?.businessName || 'Unknown'}`);
      parts.push(`Industry: ${ctx.enrichedContext?.industry || 'Unknown'}`);
      if (ctx.targetMarket) parts.push(`Target Market: ${ctx.targetMarket}`);
      if (ctx.icp) parts.push(`ICP: ${ctx.icp}`);
      if (ctx.offer) parts.push(`Offer: ${ctx.offer}`);
      if (ctx.enrichedContext?.toneOfVoice) parts.push(`Tone: ${ctx.enrichedContext.toneOfVoice}`);
      if (ctx.competitors?.length) parts.push(`Competitors: ${JSON.stringify(ctx.competitors)}`);
      if (ctx.platforms?.length) parts.push(`Platforms: ${JSON.stringify(ctx.platforms)}`);
      parts.push('');
    }
  } catch (err) {
    console.warn('[Assistant] Profile load error:', err.message);
  }

  // Load schedule status
  try {
    const schedule = await engine.getSchedule(userId);
    if (schedule) {
      parts.push('--- SCHEDULE STATUS ---');
      parts.push(`Active: ${schedule.isActive}, Tasks: ${schedule.taskCount || 0}`);
      if (schedule.tasks?.length) {
        for (const t of schedule.tasks) {
          parts.push(`  ${t.taskId}: ${t.status} (next: ${t.nextRun || 'N/A'})`);
        }
      }
      parts.push('');
    }
  } catch {
    // Schedule not available — not critical
  }

  parts.push('Today: ' + new Date().toISOString().slice(0, 10));
  return parts.join('\n');
}

// ─── Conversation History ─────────────────────────────────

async function loadHistory(userId, sessionId) {
  const rows = await prisma.conversationHistory.findMany({
    where: { userId, sessionId, agentName: AGENT_NAME },
    orderBy: { timestamp: 'asc' },
    take: MAX_HISTORY,
    select: { role: true, content: true, toolCalls: true },
  });

  const messages = [];
  for (const row of rows) {
    if (row.role === 'user') {
      messages.push({ role: 'user', content: row.content });
    } else if (row.role === 'assistant') {
      // If the assistant message had tool_use blocks, reconstruct them
      if (row.toolCalls && Array.isArray(row.toolCalls) && row.toolCalls.length > 0) {
        const content = [];
        // Add text block if there was text
        if (row.content) {
          content.push({ type: 'text', text: row.content });
        }
        // Tool calls are stored for reference but we don't replay them in history
        // Just use the text content
        messages.push({ role: 'assistant', content: row.content || '' });
      } else {
        messages.push({ role: 'assistant', content: row.content });
      }
    }
  }
  return messages;
}

async function saveMessages(userId, sessionId, userMessage, assistantText, toolCalls) {
  const data = [
    {
      userId,
      sessionId,
      role: 'user',
      content: userMessage,
      agentName: AGENT_NAME,
      metadata: {},
    },
    {
      userId,
      sessionId,
      role: 'assistant',
      content: assistantText || '',
      agentName: AGENT_NAME,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      metadata: {},
    },
  ];

  await prisma.conversationHistory.createMany({ data });
}

// ─── Core Streaming Chat ──────────────────────────────────

/**
 * Stream a chat response with tool-use loop.
 * @param {{ userId: string, message: string, sessionId: string, res: object, redis: object }} opts
 */
async function streamChat({ userId, message, sessionId, res, redis }) {
  const client = getClient();

  // Set SSE headers
  sseHeaders(res);

  try {
    const systemPrompt = await buildSystemPrompt(userId);
    const history = await loadHistory(userId, sessionId);

    // Build messages array
    const messages = [...history, { role: 'user', content: message }];

    let fullAssistantText = '';
    const allToolCalls = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let toolRound = 0;

    // Initial Claude call with streaming
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages,
      tools,
      stream: true,
    });

    // Process the stream
    let currentToolUse = null;
    let toolInputJson = '';
    let contentBlocks = [];
    let stopReason = null;

    for await (const event of response) {
      switch (event.type) {
        case 'message_start':
          if (event.message?.usage) {
            totalInputTokens += event.message.usage.input_tokens || 0;
          }
          break;

        case 'content_block_start':
          if (event.content_block?.type === 'text') {
            // Text block starting
          } else if (event.content_block?.type === 'tool_use') {
            currentToolUse = {
              id: event.content_block.id,
              name: event.content_block.name,
            };
            toolInputJson = '';
            sseWrite(res, 'tool_start', {
              tool: event.content_block.name,
              toolUseId: event.content_block.id,
            });
          }
          break;

        case 'content_block_delta':
          if (event.delta?.type === 'text_delta') {
            const text = event.delta.text;
            fullAssistantText += text;
            sseWrite(res, 'token', { text });
          } else if (event.delta?.type === 'input_json_delta') {
            toolInputJson += event.delta.partial_json;
          }
          break;

        case 'content_block_stop':
          if (currentToolUse) {
            let parsedInput = {};
            try {
              parsedInput = toolInputJson ? JSON.parse(toolInputJson) : {};
            } catch {
              parsedInput = {};
            }
            contentBlocks.push({
              type: 'tool_use',
              id: currentToolUse.id,
              name: currentToolUse.name,
              input: parsedInput,
            });
            currentToolUse = null;
            toolInputJson = '';
          } else {
            // Text block ended
            if (fullAssistantText) {
              contentBlocks.push({ type: 'text', text: fullAssistantText });
            }
          }
          break;

        case 'message_delta':
          if (event.delta?.stop_reason) {
            stopReason = event.delta.stop_reason;
          }
          if (event.usage) {
            totalOutputTokens += event.usage.output_tokens || 0;
          }
          break;
      }
    }

    // ─── Tool-Use Loop ──────────────────────────────────
    while (stopReason === 'tool_use' && toolRound < MAX_TOOL_ROUNDS) {
      toolRound++;

      const toolUseBlocks = contentBlocks.filter((b) => b.type === 'tool_use');
      const toolResults = [];

      for (const toolBlock of toolUseBlocks) {
        const result = await executeTool(toolBlock.name, toolBlock.input, { userId, redis });
        const resultStr = truncate(result);

        allToolCalls.push({
          tool: toolBlock.name,
          input: toolBlock.input,
          result: typeof result === 'string' ? result : JSON.stringify(result),
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: typeof resultStr === 'string' ? resultStr : JSON.stringify(resultStr),
        });

        sseWrite(res, 'tool_result', {
          tool: toolBlock.name,
          toolUseId: toolBlock.id,
          success: !result?.error,
        });
      }

      // Add assistant + tool results to messages
      messages.push({ role: 'assistant', content: contentBlocks });
      messages.push({ role: 'user', content: toolResults });

      // Reset for next round
      contentBlocks = [];
      fullAssistantText = '';
      stopReason = null;

      // Next Claude call
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages,
        tools,
        stream: true,
      });

      currentToolUse = null;
      toolInputJson = '';

      for await (const event of response) {
        switch (event.type) {
          case 'message_start':
            if (event.message?.usage) {
              totalInputTokens += event.message.usage.input_tokens || 0;
            }
            break;

          case 'content_block_start':
            if (event.content_block?.type === 'tool_use') {
              currentToolUse = {
                id: event.content_block.id,
                name: event.content_block.name,
              };
              toolInputJson = '';
              sseWrite(res, 'tool_start', {
                tool: event.content_block.name,
                toolUseId: event.content_block.id,
              });
            }
            break;

          case 'content_block_delta':
            if (event.delta?.type === 'text_delta') {
              const text = event.delta.text;
              fullAssistantText += text;
              sseWrite(res, 'token', { text });
            } else if (event.delta?.type === 'input_json_delta') {
              toolInputJson += event.delta.partial_json;
            }
            break;

          case 'content_block_stop':
            if (currentToolUse) {
              let parsedInput = {};
              try {
                parsedInput = toolInputJson ? JSON.parse(toolInputJson) : {};
              } catch {
                parsedInput = {};
              }
              contentBlocks.push({
                type: 'tool_use',
                id: currentToolUse.id,
                name: currentToolUse.name,
                input: parsedInput,
              });
              currentToolUse = null;
              toolInputJson = '';
            }
            break;

          case 'message_delta':
            if (event.delta?.stop_reason) {
              stopReason = event.delta.stop_reason;
            }
            if (event.usage) {
              totalOutputTokens += event.usage.output_tokens || 0;
            }
            break;
        }
      }
    }

    // ─── Cost Tracking ──────────────────────────────────
    const costUsd = (totalInputTokens * 3 + totalOutputTokens * 15) / 1_000_000;
    if (redis && costUsd > 0) {
      await trackCost(redis, 'claude', costUsd).catch(() => {});
    }

    // ─── Save to DB ─────────────────────────────────────
    await saveMessages(userId, sessionId, message, fullAssistantText, allToolCalls).catch((err) =>
      console.error('[Assistant] Save error:', err.message)
    );

    // ─── Done ───────────────────────────────────────────
    sseWrite(res, 'done', {
      sessionId,
      toolCalls: allToolCalls.length,
      tokens: { input: totalInputTokens, output: totalOutputTokens },
      cost: costUsd,
    });

    res.end();
  } catch (err) {
    console.error('[Assistant] Stream error:', err.message);
    if (!res.writableEnded) {
      sseWrite(res, 'error', { message: err.message });
      res.end();
    }
  }
}

module.exports = { streamChat };
