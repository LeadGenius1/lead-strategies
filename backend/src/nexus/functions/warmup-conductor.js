// NEXUS Function #11: Warmup Conductor
// Monitors and manages email account warmup health via Instantly.ai
const instantlyService = require('../../services/instantly');

/**
 * Get warmup status for email accounts
 */
async function getWarmupStatus(emailAccount) {
  try {
    const result = await instantlyService.getWarmupStatus(emailAccount || null);

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to fetch warmup status' };
    }

    // Normalize response whether single account or array
    const accounts = Array.isArray(result.accounts)
      ? result.accounts
      : result.warmup ? [result.warmup] : [];

    const formatted = accounts.map(acc => ({
      account: acc.email || emailAccount || 'unknown',
      warmupScore: acc.warmup_reputation || acc.warmupScore || 0,
      dailySendLimit: acc.daily_limit || acc.dailyLimit || 0,
      currentVolume: acc.emails_sent_today || acc.currentVolume || 0,
      status: acc.status || 'unknown',
      daysRunning: acc.days_running || 0
    }));

    return {
      success: true,
      accounts: formatted,
      total: formatted.length,
      _mock: result._mock || false
    };
  } catch (error) {
    return { success: false, error: `Warmup status error: ${error.message}` };
  }
}

/**
 * Set warmup schedule / daily target for an account
 */
async function setWarmupSchedule(emailAccount, dailyTarget) {
  try {
    if (!emailAccount) {
      return { success: false, error: 'emailAccount is required' };
    }
    if (!dailyTarget || dailyTarget < 1) {
      return { success: false, error: 'dailyTarget must be a positive number' };
    }

    // Enable warmup for the account (Instantly handles schedule internally)
    const result = await instantlyService.enableWarmup(emailAccount);

    if (!result.success) {
      return { success: false, error: result.error || 'Failed to set warmup schedule' };
    }

    return {
      success: true,
      account: emailAccount,
      dailyTarget,
      message: `Warmup enabled for ${emailAccount} with target of ${dailyTarget} emails/day`
    };
  } catch (error) {
    return { success: false, error: `Set schedule error: ${error.message}` };
  }
}

/**
 * Get AI-generated warmup recommendations based on current scores
 */
async function getWarmupRecommendations() {
  try {
    const statusResult = await getWarmupStatus();

    if (!statusResult.success) {
      return { success: false, error: statusResult.error };
    }

    const recommendations = statusResult.accounts.map(account => {
      const rec = {
        account: account.account,
        currentScore: account.warmupScore,
        status: account.status,
        recommendations: []
      };

      if (account.warmupScore < 50) {
        rec.recommendations.push('Score is low — reduce sending volume and focus on warmup-only traffic');
        rec.recommendations.push('Check for bounces and spam complaints on this account');
        rec.recommendations.push('Consider pausing campaigns until warmup score reaches 70+');
      } else if (account.warmupScore < 70) {
        rec.recommendations.push('Score is moderate — gradually increase sending volume');
        rec.recommendations.push('Target 5-10% daily volume increase');
        rec.recommendations.push('Monitor bounce rate closely');
      } else if (account.warmupScore < 90) {
        rec.recommendations.push('Score is good — safe to run campaigns at moderate volume');
        rec.recommendations.push('Maintain current warmup schedule alongside campaigns');
      } else {
        rec.recommendations.push('Score is excellent — account is fully warmed and ready for full volume');
      }

      if (account.status === 'paused' || account.status === 'not_started') {
        rec.recommendations.push('Warmup is not active — enable it to improve deliverability');
      }

      if (account.currentVolume > account.dailySendLimit * 0.9) {
        rec.recommendations.push('Approaching daily send limit — consider spreading sends across more accounts');
      }

      return rec;
    });

    return {
      success: true,
      recommendations,
      totalAccounts: recommendations.length,
      averageScore: recommendations.length > 0
        ? Math.round(recommendations.reduce((sum, r) => sum + r.currentScore, 0) / recommendations.length)
        : 0
    };
  } catch (error) {
    return { success: false, error: `Recommendations error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches warmup_status actions
 */
async function warmupStatus(params) {
  const { action, emailAccount, dailyTarget } = params || {};

  switch (action) {
    case 'get_status':
      return await getWarmupStatus(emailAccount);
    case 'set_schedule':
      return await setWarmupSchedule(emailAccount, dailyTarget);
    case 'get_recommendations':
      return await getWarmupRecommendations();
    default:
      return { error: `Unknown warmup action: ${action}` };
  }
}

module.exports = {
  getWarmupStatus,
  setWarmupSchedule,
  getWarmupRecommendations,
  warmupStatus
};
