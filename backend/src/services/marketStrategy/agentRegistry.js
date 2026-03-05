// ═══════════════════════════════════════════════════════════════
// MARKET STRATEGY PIPELINE — AGENT REGISTRY
// 7 agents keyed by stable ID. Each has: stage, providers, execute(ctx).
// execute() receives: { businessInputs, context, providers, redis, emit }
// Providers are the wrapper modules from ./providers/ (cache+retry+circuit breaker built in).
// ═══════════════════════════════════════════════════════════════

const firecrawl = require("./providers/firecrawl");
const perplexity = require("./providers/perplexity");
const chatgpt = require("./providers/chatgpt");

// Platform domains for competitor-teardown audits
const PLATFORM_DOMAINS = {
  // Backend canonical names
  LeadSite:      "leadsiteio.com",
  LeadSiteAI:    "leadsiteai.com",
  ClientContact: "clientcontactio.com",
  VideoSite:     "videositeai.com",
  UltraLead:     "ultraleadai.com",
  // Frontend kebab-case IDs (from PLATFORM_OPTIONS)
  "leadsite-io":      "leadsiteio.com",
  "leadsite-ai":      "leadsiteai.com",
  "clientcontact-io":  "clientcontactio.com",
  "videosite-ai":      "videositeai.com",
  "ultralead":         "ultraleadai.com",
};

const AGENT_REGISTRY = {

  // ═══ STAGE 0: GATHER ═══

  "nexus-research": {
    stage: 0,
    providers: ["firecrawl", "perplexity"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      const sources = [];

      // 1. Firecrawl: scrape each competitor URL
      emit("agent_progress", { progress: 10, message: "Scraping competitor sites", provider: "firecrawl" });
      const competitors = [];
      for (const url of (businessInputs.competitors || [])) {
        const result = await firecrawl.scrape(url, redis);
        competitors.push({
          url,
          title: result.title,
          content: result.content,
          metadata: result.metadata,
          cached: result.cached,
        });
        sources.push(url);
      }
      emit("agent_progress", { progress: 40, message: `Scraped ${competitors.length} competitor sites`, provider: "firecrawl" });

      // 2. Perplexity: research market landscape (3 queries)
      emit("agent_progress", { progress: 50, message: "Researching market landscape", provider: "perplexity" });

      const marketQueries = [
        `${businessInputs.targetMarket} market size trends 2026`,
        `${businessInputs.targetMarket} top competitors digital marketing`,
        `best marketing channels for ${businessInputs.icp}`,
      ];

      const marketIntel = {};
      for (let i = 0; i < marketQueries.length; i++) {
        const query = marketQueries[i];
        const result = await perplexity.research(query, redis);
        marketIntel[`query_${i}`] = {
          query,
          answer: result.answer,
          citations: result.citations,
          cached: result.cached,
        };
        emit("agent_progress", {
          progress: 50 + Math.round(((i + 1) / marketQueries.length) * 35),
          message: `Market research ${i + 1}/${marketQueries.length} complete`,
          provider: "perplexity",
        });
      }

      // 3. Structure output
      emit("agent_progress", { progress: 90, message: "Structuring findings" });

      return { competitors, marketIntel, sources };
    },
  },

  "competitor-teardown": {
    stage: 0,
    providers: ["firecrawl"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      // 1. Crawl user's platform sites
      emit("agent_progress", { progress: 10, message: "Auditing your platform sites", provider: "firecrawl" });

      const yourSites = [];
      const selectedPlatforms = businessInputs.platforms || [];
      for (let i = 0; i < selectedPlatforms.length; i++) {
        const platformName = selectedPlatforms[i];
        const domain = PLATFORM_DOMAINS[platformName];
        if (!domain) continue;

        const result = await firecrawl.crawl(`https://${domain}`, redis, { maxPages: 5 });
        yourSites.push({
          platform: platformName,
          domain,
          pages: result.pages,
          totalPages: result.totalPages,
          cached: result.cached,
        });
        emit("agent_progress", {
          progress: 10 + Math.round(((i + 1) / selectedPlatforms.length) * 25),
          message: `Audited ${platformName}`,
          provider: "firecrawl",
        });
      }

      // 2. Crawl competitor sites
      emit("agent_progress", { progress: 40, message: "Auditing competitor sites", provider: "firecrawl" });

      const competitorSites = [];
      const competitorUrls = businessInputs.competitors || [];
      for (let i = 0; i < competitorUrls.length; i++) {
        const url = competitorUrls[i];
        const result = await firecrawl.crawl(url, redis, { maxPages: 5 });
        competitorSites.push({
          url,
          pages: result.pages,
          totalPages: result.totalPages,
          cached: result.cached,
        });
        emit("agent_progress", {
          progress: 40 + Math.round(((i + 1) / competitorUrls.length) * 30),
          message: `Audited competitor ${i + 1}/${competitorUrls.length}`,
          provider: "firecrawl",
        });
      }

      // 3. Identify gaps
      emit("agent_progress", { progress: 85, message: "Identifying gaps" });
      const gaps = [];
      for (const comp of competitorSites) {
        if (comp.totalPages > 0) {
          const hasSchema = comp.pages.some(p =>
            p.content && p.content.includes("schema.org")
          );
          if (hasSchema) {
            gaps.push({ url: comp.url, gap: "Competitor has schema markup" });
          }
        }
      }

      return { yourSites, competitorSites, gaps };
    },
  },

  // ═══ STAGE 1: ANALYZE ═══

  "positioning": {
    stage: 1,
    providers: ["chatgpt", "perplexity"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      // Read stage 0 context
      const researchData = context["nexus-research"] || {};
      const teardownData = context["competitor-teardown"] || {};

      // 1. Perplexity: validate positioning hypotheses
      emit("agent_progress", { progress: 15, message: "Validating positioning against market data", provider: "perplexity" });
      const validation = await perplexity.research(
        `Given the market "${businessInputs.targetMarket}" targeting "${businessInputs.icp}", ` +
        `what positioning gaps exist for a SaaS platform offering: ${businessInputs.offer}? ` +
        `How should they differentiate against competitors?`,
        redis,
        { maxTokens: 1500 }
      );

      emit("agent_progress", { progress: 40, message: "Positioning research complete", provider: "perplexity" });

      // 2. ChatGPT: synthesize positioning with provenance guardrail
      emit("agent_progress", { progress: 50, message: "Crafting positioning strategy", provider: "chatgpt" });

      const contextSummary = JSON.stringify({
        marketIntel: researchData.marketIntel || {},
        gaps: teardownData.gaps || [],
        validation: validation.answer,
      });

      const result = await chatgpt.chat({
        systemPrompt:
          "You are a market positioning strategist. Analyze the provided research data and create a positioning strategy. " +
          "Return valid JSON with keys: positioning (string), differentiators (array of strings), " +
          "targetKeywords (array of strings), competitiveGaps (array of strings).",
        userPrompt:
          `Business: ${businessInputs.targetMarket}\nICP: ${businessInputs.icp}\nOffer: ${businessInputs.offer}\n\n` +
          `Research context:\n${contextSummary}`,
        provenanceUrls: context.sources || [],
        maxTokens: 2000,
      }, redis);

      emit("agent_progress", { progress: 85, message: "Positioning strategy complete", provider: "chatgpt" });

      // Parse structured output
      let output;
      try {
        output = JSON.parse(result.content);
      } catch {
        output = {
          positioning: result.content,
          differentiators: [],
          targetKeywords: [],
          competitiveGaps: [],
        };
      }

      return output;
    },
  },

  "channel-plan": {
    stage: 1,
    providers: ["chatgpt", "perplexity"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      // 1. Perplexity: research channel benchmarks
      emit("agent_progress", { progress: 15, message: "Researching channel benchmarks", provider: "perplexity" });
      const benchmarks = await perplexity.research(
        `Best digital marketing channels for reaching ${businessInputs.icp} in the ${businessInputs.targetMarket} market. ` +
        `Include benchmarks: average CPC, conversion rates, ROI. Budget range: ${businessInputs.budgetRange}.`,
        redis,
        { maxTokens: 1500 }
      );

      emit("agent_progress", { progress: 40, message: "Channel benchmarks collected", provider: "perplexity" });

      // 2. ChatGPT: recommend channel mix + budget allocation
      emit("agent_progress", { progress: 50, message: "Building channel recommendations", provider: "chatgpt" });

      const researchData = context["nexus-research"] || {};
      const result = await chatgpt.chat({
        systemPrompt:
          "You are a digital marketing channel strategist. Create a comprehensive channel plan. " +
          "Return valid JSON with keys: channels (array of {name, priority, budgetPercent, expectedROI}), " +
          "contentCalendar (object with monthly themes), budgetAllocation (object by channel), " +
          "sequenceMap (object with phases: awareness, consideration, decision).",
        userPrompt:
          `Market: ${businessInputs.targetMarket}\nICP: ${businessInputs.icp}\n` +
          `Budget: ${businessInputs.budgetRange}\nPlatforms: ${(businessInputs.platforms || []).join(", ")}\n\n` +
          `Channel benchmarks:\n${benchmarks.answer}\n\n` +
          `Market intel:\n${JSON.stringify(researchData.marketIntel || {})}`,
        provenanceUrls: context.sources || [],
        maxTokens: 2500,
      }, redis);

      emit("agent_progress", { progress: 85, message: "Channel plan complete", provider: "chatgpt" });

      let output;
      try {
        output = JSON.parse(result.content);
      } catch {
        output = {
          channels: [],
          contentCalendar: {},
          budgetAllocation: {},
          sequenceMap: { raw: result.content },
        };
      }

      return output;
    },
  },

  // ═══ STAGE 2: BUILD ═══

  "platform-structure": {
    stage: 2,
    providers: ["chatgpt"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      // Read stages 0+1 context
      const positioning = context["positioning"] || {};
      const channelPlan = context["channel-plan"] || {};
      const teardown = context["competitor-teardown"] || {};

      // 1. ChatGPT: page architecture + JSON-LD schemas
      emit("agent_progress", { progress: 20, message: "Designing page architecture", provider: "chatgpt" });

      const archResult = await chatgpt.chat({
        systemPrompt:
          "You are a technical SEO architect. Design page architecture for a multi-platform SaaS. " +
          "Return valid JSON with keys: pageArchitecture (object with comparison, integration, useCase, template pages), " +
          "schemas (object with JSON-LD schema definitions for SoftwareApplication, FAQPage, VideoObject, Article), " +
          "sitemapPlan (object with structure and canonical rules).",
        userPrompt:
          `Platforms: ${(businessInputs.platforms || []).join(", ")}\n` +
          `Target market: ${businessInputs.targetMarket}\n` +
          `Positioning: ${JSON.stringify(positioning)}\n` +
          `Channel plan: ${JSON.stringify(channelPlan)}\n` +
          `Competitor site audit: ${JSON.stringify(teardown.gaps || [])}`,
        provenanceUrls: context.sources || [],
        maxTokens: 3000,
      }, redis);

      emit("agent_progress", { progress: 55, message: "Page architecture designed", provider: "chatgpt" });

      // 2. ChatGPT: programmatic page templates
      emit("agent_progress", { progress: 60, message: "Generating page templates", provider: "chatgpt" });

      const templateResult = await chatgpt.chat({
        systemPrompt:
          "You are a web development architect. Generate reusable page templates for programmatic SEO. " +
          "Return valid JSON with keys: comparisonTemplate (HTML structure), integrationTemplate (HTML structure), " +
          "ogTemplate (OpenGraph meta template), twitterCardTemplate (Twitter Card meta template).",
        userPrompt:
          `Platforms: ${(businessInputs.platforms || []).join(", ")}\n` +
          `Target keywords: ${JSON.stringify(positioning.targetKeywords || [])}\n` +
          `Generate templates for: 50 comparison pages, 100 integration pages.`,
        provenanceUrls: context.sources || [],
        maxTokens: 2500,
      }, redis);

      emit("agent_progress", { progress: 90, message: "Templates generated", provider: "chatgpt" });

      // Combine outputs
      let architecture, templates;
      try { architecture = JSON.parse(archResult.content); } catch { architecture = { raw: archResult.content }; }
      try { templates = JSON.parse(templateResult.content); } catch { templates = { raw: templateResult.content }; }

      return {
        pageArchitecture: architecture.pageArchitecture || architecture,
        schemas: architecture.schemas || {},
        templates,
        sitemapPlan: architecture.sitemapPlan || {},
      };
    },
  },

  "offer-funnel": {
    stage: 2,
    providers: ["chatgpt", "perplexity"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      const positioning = context["positioning"] || {};

      // 1. Perplexity: AEO research
      emit("agent_progress", { progress: 15, message: "Researching AEO best practices", provider: "perplexity" });
      const aeoResearch = await perplexity.research(
        `AI Engine Optimization (AEO) best practices for ${businessInputs.targetMarket} SaaS. ` +
        `How to write entity-rich summaries (40-60 words) that AI assistants cite. ` +
        `Include FAQ schema best practices.`,
        redis,
        { maxTokens: 1500 }
      );

      emit("agent_progress", { progress: 35, message: "AEO research complete", provider: "perplexity" });

      // 2. ChatGPT: conversion copy + AEO summaries + outreach + funnel
      emit("agent_progress", { progress: 45, message: "Building funnel copy + AEO content", provider: "chatgpt" });

      const result = await chatgpt.chat({
        systemPrompt:
          "You are a conversion copywriter and AEO specialist. Create conversion-optimized content. " +
          "Return valid JSON with keys: " +
          "aeoSummaries (object by platform, each 40-60 word entity-rich summary), " +
          "faqSets (object by platform, each an array of {question, answer} for FAQPage schema), " +
          "outreachTemplates (array of email templates for link building), " +
          "funnelArchitecture (object with awareness, consideration, decision phases).",
        userPrompt:
          `Market: ${businessInputs.targetMarket}\nICP: ${businessInputs.icp}\nOffer: ${businessInputs.offer}\n` +
          `Platforms: ${(businessInputs.platforms || []).join(", ")}\n\n` +
          `Positioning: ${JSON.stringify(positioning)}\n\n` +
          `AEO research:\n${aeoResearch.answer}`,
        provenanceUrls: context.sources || [],
        maxTokens: 3000,
      }, redis);

      emit("agent_progress", { progress: 90, message: "Funnel content complete", provider: "chatgpt" });

      let output;
      try { output = JSON.parse(result.content); } catch {
        output = { aeoSummaries: {}, faqSets: {}, outreachTemplates: [], funnelArchitecture: { raw: result.content } };
      }

      return output;
    },
  },

  // ═══ STAGE 3: SYNTHESIZE ═══

  "exec-summary": {
    stage: 3,
    providers: ["chatgpt"],
    execute: async ({ businessInputs, context, redis, emit }) => {
      // Read ALL prior context (stages 0+1+2)
      emit("agent_progress", { progress: 20, message: "Gathering all stage outputs", provider: "chatgpt" });

      // Build comprehensive context string (truncate to avoid token overflow)
      const allContext = {
        research: context["nexus-research"] || {},
        teardown: context["competitor-teardown"] || {},
        positioning: context["positioning"] || {},
        channelPlan: context["channel-plan"] || {},
        platformStructure: context["platform-structure"] || {},
        offerFunnel: context["offer-funnel"] || {},
      };
      const contextStr = JSON.stringify(allContext);
      const truncatedContext = contextStr.length > 30000
        ? contextStr.substring(0, 30000) + "...(truncated)"
        : contextStr;

      emit("agent_progress", { progress: 40, message: "Synthesizing executive brief", provider: "chatgpt" });

      const result = await chatgpt.chat({
        systemPrompt:
          "You are a senior marketing strategist writing an executive brief. " +
          "Synthesize ALL the research, positioning, channel plans, page architecture, and funnel content " +
          "into a comprehensive, actionable executive summary. " +
          "Return valid JSON with keys: " +
          "summary (string, 1-page executive summary), " +
          "actionItems (array of {priority: 1-5, action: string, owner: string, deadline: string}), " +
          "kpis (object: indexedPages, organicVisits, keywords, aiCitations targets), " +
          "timeline (object: 8-week implementation plan with weekly milestones), " +
          "budget (object: recommended allocation based on channel plan), " +
          "risks (array of {risk: string, impact: string, mitigation: string}).",
        userPrompt:
          `Business: ${businessInputs.targetMarket}\nICP: ${businessInputs.icp}\n` +
          `Offer: ${businessInputs.offer}\nBudget: ${businessInputs.budgetRange}\n` +
          `Platforms: ${(businessInputs.platforms || []).join(", ")}\n` +
          `${businessInputs.notes ? `Notes: ${businessInputs.notes}\n` : ""}\n` +
          `Complete strategy context:\n${truncatedContext}`,
        provenanceUrls: context.sources || [],
        model: "gpt-4o",
        maxTokens: 4000,
      }, redis);

      emit("agent_progress", { progress: 90, message: "Executive brief complete", provider: "chatgpt" });

      let output;
      try { output = JSON.parse(result.content); } catch {
        output = {
          summary: result.content,
          actionItems: [],
          kpis: {},
          timeline: {},
          budget: {},
          risks: [],
        };
      }

      return output;
    },
  },
};

module.exports = AGENT_REGISTRY;
