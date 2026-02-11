// Manages provisioning/deprovisioning of managed email pool accounts
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/email-oauth/token-manager';

const POOL_EMAIL_TEMPLATES = [
  { email: 'outreach1@leads.aileadstrategies.com', displayName: 'AI Lead Strategies Outreach' },
  { email: 'outreach2@leads.aileadstrategies.com', displayName: 'AI Lead Strategies Outreach' },
  { email: 'outreach3@leads.aileadstrategies.com', displayName: 'AI Lead Strategies Outreach' },
  { email: 'outreach4@leads.aileadstrategies.com', displayName: 'AI Lead Strategies Outreach' },
];

export async function provisionPoolEmails(userId: string, subscriptionId: string) {
  const smtpPassword = process.env.POOL_SMTP_PASSWORD || '';
  const encryptedPassword = smtpPassword ? encryptToken(smtpPassword) : null;

  for (let i = 0; i < POOL_EMAIL_TEMPLATES.length; i++) {
    const template = POOL_EMAIL_TEMPLATES[i];
    const userPoolEmail = template.email.replace('@', `-${userId.slice(-6)}@`);

    await prisma.userEmailAccount.create({
      data: {
        userId,
        email: userPoolEmail,
        displayName: template.displayName,
        provider: 'MANAGED_POOL',
        status: 'WARMING',
        tier: 'PRO',
        dailyLimit: 200,
        poolSubscriptionId: subscriptionId,
        poolRotationOrder: i + 1,
        warmupStartedAt: new Date(),
        warmupDailyLimit: 10,
        warmupCurrentDay: 0,
        smtpHost: process.env.POOL_SMTP_HOST || 'smtp.mailgun.org',
        smtpPort: 587,
        smtpUsername: process.env.POOL_SMTP_USERNAME || '',
        smtpPassword: encryptedPassword,
      },
    });
  }

  return POOL_EMAIL_TEMPLATES.length;
}

export async function deprovisionPoolEmails(userId: string, subscriptionId: string) {
  const result = await prisma.userEmailAccount.updateMany({
    where: {
      userId,
      poolSubscriptionId: subscriptionId,
      provider: 'MANAGED_POOL',
    },
    data: {
      status: 'DISCONNECTED',
      smtpPassword: null,
    },
  });

  return result.count;
}

export async function getPoolStatus(userId: string) {
  const subscription = await prisma.emailPoolSubscription.findUnique({
    where: { userId },
    include: {
      poolAccounts: {
        select: {
          id: true,
          email: true,
          status: true,
          reputationScore: true,
          dailySentCount: true,
          dailyLimit: true,
          warmupCurrentDay: true,
          poolRotationOrder: true,
          lastSentAt: true,
        },
        orderBy: { poolRotationOrder: 'asc' },
      },
    },
  });

  if (!subscription) return null;

  const totalSentToday = subscription.poolAccounts.reduce(
    (sum, a) => sum + a.dailySentCount,
    0
  );

  return {
    subscription: {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      totalDailyLimit: subscription.totalDailyLimit,
    },
    accounts: subscription.poolAccounts,
    totalSentToday,
    remainingToday: subscription.totalDailyLimit - totalSentToday,
  };
}
