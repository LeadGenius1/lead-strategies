import { prisma } from '@/lib/prisma';
import { testSmtpConnection } from '@/lib/email-smtp/smtp-handler';
import { decryptToken } from '@/lib/email-oauth/token-manager';
import { emailSentinelQueue } from './index';

export async function checkAllAccountHealth() {
  const accounts = await prisma.userEmailAccount.findMany({
    where: { status: { in: ['ACTIVE', 'WARMING'] } },
  });

  const results: Array<{ accountId: string; email?: string; tier?: string; healthy?: boolean; issues?: string[] }> = [];
  for (const account of accounts) {
    try {
      results.push(await checkSingleAccountHealth(account.id));
    } catch (err) {
      results.push({
        accountId: account.id,
        healthy: false,
        issues: [err instanceof Error ? err.message : 'Unknown error'],
      });
    }
  }

  return {
    checked: results.length,
    healthy: results.filter((r) => r.healthy).length,
    unhealthy: results.filter((r) => !r.healthy).length,
  };
}

export async function checkSingleAccountHealth(accountId: string) {
  const account = await prisma.userEmailAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error(`Account ${accountId} not found`);

  let healthy = true;
  const issues: string[] = [];

  if (account.bounceRate > 0.05) {
    healthy = false;
    issues.push(`High bounce: ${(account.bounceRate * 100).toFixed(1)}%`);
    if (account.bounceRate > 0.1) {
      await emailSentinelQueue.add('auto-pause', {
        accountId: account.id,
        reason: `Critical bounce: ${(account.bounceRate * 100).toFixed(1)}%`,
      });
    }
  }

  if (account.spamComplaintRate > 0.003) {
    healthy = false;
    issues.push(`High spam: ${(account.spamComplaintRate * 100).toFixed(2)}%`);
    if (account.spamComplaintRate > 0.01) {
      await emailSentinelQueue.add('auto-pause', {
        accountId: account.id,
        reason: `Critical spam: ${(account.spamComplaintRate * 100).toFixed(2)}%`,
      });
    }
  }

  if (account.reputationScore < 50) {
    healthy = false;
    issues.push(`Low reputation: ${account.reputationScore}`);
  }

  if (
    ['SMTP', 'MANAGED_POOL'].includes(account.provider) &&
    account.smtpHost &&
    account.smtpPassword
  ) {
    try {
      const testResult = await testSmtpConnection({
        host: account.smtpHost,
        port: account.smtpPort || 587,
        username: account.smtpUsername || '',
        password: decryptToken(account.smtpPassword),
      });
      if (!testResult.success) {
        healthy = false;
        issues.push(`SMTP failed: ${testResult.message}`);
      }
    } catch (err) {
      healthy = false;
      issues.push(`SMTP error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  await prisma.userEmailAccount.update({
    where: { id: accountId },
    data: {
      lastHealthCheck: new Date(),
      status:
        healthy || account.bounceRate <= 0.1 ? account.status : 'PAUSED',
    },
  });

  return {
    accountId: account.id,
    email: account.email,
    tier: account.tier,
    healthy,
    issues,
  };
}
