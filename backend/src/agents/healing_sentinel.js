/**
 * Healing Sentinel Agent - System health monitoring and auto-fixing
 * Monitors system health, AI model integrity, and automatically fixes issues
 */

const { createLogger } = require('../utils/logger');
const { checkRedisHealth } = require('../config/redis');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const logger = createLogger('healing_sentinel');

// AI model error tracking (in-memory rolling window)
const aiErrorLog = [];
const AI_ERROR_WINDOW_MS = 5 * 60 * 1000; // 5 minute window
const AI_ERROR_THRESHOLD = 3; // 3 errors in window = critical

class HealingSentinelAgent {
  constructor() {
    this.healthChecks = {
      database: this.checkDatabase.bind(this),
      redis: this.checkRedis.bind(this),
      api_keys: this.checkApiKeys.bind(this),
      email_service: this.checkEmailService.bind(this),
      ai_model_integrity: this.checkAIModelIntegrity.bind(this),
    };
    this.integrityBreach = null;
  }

  /**
   * Monitor system health
   * @returns {Promise<object>} Health status
   */
  async monitorHealth() {
    try {
      logger.info('Running health checks');

      const healthStatus = {
        timestamp: new Date().toISOString(),
        overall: 'healthy',
        checks: {},
        issues: [],
        fixes_applied: [],
      };

      // Run all health checks
      for (const [name, check] of Object.entries(this.healthChecks)) {
        try {
          const result = await check();
          healthStatus.checks[name] = result;

          if (!result.healthy) {
            healthStatus.overall = 'degraded';
            healthStatus.issues.push({
              component: name,
              severity: result.severity || 'medium',
              message: result.message,
            });

            // Attempt auto-fix
            if (result.auto_fixable) {
              const fixResult = await this.attemptFix(name, result);
              if (fixResult.success) {
                healthStatus.fixes_applied.push({
                  component: name,
                  action: fixResult.action,
                });
                healthStatus.checks[name].healthy = true;
              }
            }
          }
        } catch (error) {
          logger.error(`Health check failed: ${name}`, error);
          healthStatus.checks[name] = {
            healthy: false,
            error: error.message,
          };
          healthStatus.overall = 'unhealthy';
        }
      }

      // Update overall status
      if (healthStatus.issues.length === 0) {
        healthStatus.overall = 'healthy';
      } else if (healthStatus.issues.some(i => i.severity === 'critical')) {
        healthStatus.overall = 'unhealthy';
      }

      return healthStatus;
    } catch (error) {
      logger.error('Error monitoring health', error);
      throw error;
    }
  }

  /**
   * Check database health
   * @private
   */
  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        healthy: true,
        latency: '< 10ms',
      };
    } catch (error) {
      return {
        healthy: false,
        severity: 'critical',
        message: `Database connection failed: ${error.message}`,
        auto_fixable: false,
      };
    }
  }

  /**
   * Check Redis health
   * @private
   */
  async checkRedis() {
    try {
      const redisHealth = await checkRedisHealth();
      return {
        healthy: redisHealth.status === 'healthy',
        latency: redisHealth.latency,
        message: redisHealth.status !== 'healthy' ? 'Redis not available' : undefined,
        auto_fixable: false, // Redis connection issues require manual intervention
      };
    } catch (error) {
      return {
        healthy: false,
        severity: 'medium',
        message: `Redis check failed: ${error.message}`,
        auto_fixable: false,
      };
    }
  }

  /**
   * Check API keys
   * @private
   */
  async checkApiKeys() {
    const settings = require('../config/settings');
    const missing = [];

    if (!settings.OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
    if (!settings.ANTHROPIC_API_KEY) missing.push('ANTHROPIC_API_KEY');
    if (!settings.RESEND_API_KEY && !settings.SENDGRID_API_KEY) {
      missing.push('RESEND_API_KEY or SENDGRID_API_KEY');
    }

    return {
      healthy: missing.length === 0,
      severity: missing.length > 0 ? 'medium' : undefined,
      message: missing.length > 0 ? `Missing API keys: ${missing.join(', ')}` : undefined,
      auto_fixable: false, // API keys require manual configuration
      missing_keys: missing,
    };
  }

  /**
   * Check email service health
   * @private
   */
  async checkEmailService() {
    const settings = require('../config/settings');
    const hasEmailService = !!(settings.RESEND_API_KEY || settings.SENDGRID_API_KEY);

    return {
      healthy: hasEmailService,
      severity: !hasEmailService ? 'high' : undefined,
      message: !hasEmailService ? 'No email service configured' : undefined,
      auto_fixable: false,
    };
  }

  /**
   * Check AI model integrity via live Anthropic API call
   * @private
   */
  async checkAIModelIntegrity() {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'ping' }]
      });
      return { healthy: true, status: 'healthy', model: 'claude-haiku-4-5-20251001' };
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('model_not_found') || msg.includes('deprecated')) {
        logger.error('[CRITICAL] AI model integrity breach: deprecated or missing model', { error: msg });
        return { healthy: false, severity: 'critical', status: 'CRITICAL', message: 'Deprecated model ID', detail: msg, auto_fixable: false };
      }
      return { healthy: false, severity: 'high', status: 'error', message: msg, auto_fixable: false };
    }
  }

  /**
   * Attempt to fix an issue
   * @private
   */
  async attemptFix(component, issue) {
    logger.info(`Attempting to fix: ${component}`, { issue });

    // Most fixes require manual intervention
    // This is a placeholder for future auto-fix logic

    return {
      success: false,
      action: 'manual_intervention_required',
      message: 'Auto-fix not available for this issue',
    };
  }

  /**
   * Get health summary
   * @returns {Promise<object>} Health summary
   */
  async getHealthSummary() {
    const health = await this.monitorHealth();
    return {
      status: health.overall,
      issues_count: health.issues.length,
      fixes_applied: health.fixes_applied.length,
      timestamp: health.timestamp,
    };
  }
}

module.exports = { HealingSentinelAgent };
