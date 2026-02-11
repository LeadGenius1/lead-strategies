import { prisma } from '@/lib/prisma';

const FREE_WARMUP_SCHEDULE = [
  { day: 1, limit: 5 },
  { day: 3, limit: 10 },
  { day: 5, limit: 15 },
  { day: 7, limit: 25 },
  { day: 14, limit: 35 },
  { day: 21, limit: 45 },
  { day: 30, limit: 50 },
];

const PRO_WARMUP_SCHEDULE = [
  { day: 1, limit: 10 },
  { day: 3, limit: 25 },
  { day: 5, limit: 50 },
  { day: 7, limit: 80 },
  { day: 10, limit: 120 },
  { day: 14, limit: 160 },
  { day: 21, limit: 200 },
];

function getScheduleLimit(
  schedule: typeof FREE_WARMUP_SCHEDULE,
  day: number
): number {
  const entry = [...schedule].reverse().find((s) => s.day <= day);
  return entry ? entry.limit : schedule[schedule.length - 1].limit;
}

export async function progressWarmup() {
  const warmingAccounts = await prisma.userEmailAccount.findMany({
    where: { status: 'WARMING' },
  });

  const results: Array<{ email: string; tier: string; day: number; limit: number; graduated: boolean }> = [];

  for (const account of warmingAccounts) {
    const newDay = account.warmupCurrentDay + 1;
    const schedule = account.tier === 'PRO' ? PRO_WARMUP_SCHEDULE : FREE_WARMUP_SCHEDULE;
    const newLimit = getScheduleLimit(schedule, newDay);
    const maxLimit = account.tier === 'PRO' ? 200 : 50;
    const shouldGraduate =
      newDay >= (account.tier === 'PRO' ? 21 : 30) &&
      account.reputationScore >= 80 &&
      account.bounceRate < 0.02;

    await prisma.userEmailAccount.update({
      where: { id: account.id },
      data: {
        warmupCurrentDay: newDay,
        warmupDailyLimit: Math.min(newLimit, maxLimit),
        dailySentCount: 0,
        dailySentResetAt: new Date(),
        status: shouldGraduate ? 'ACTIVE' : 'WARMING',
        dailyLimit: shouldGraduate ? maxLimit : Math.min(newLimit, maxLimit),
      },
    });

    results.push({
      email: account.email,
      tier: account.tier,
      day: newDay,
      limit: newLimit,
      graduated: shouldGraduate,
    });
  }

  return {
    processed: results.length,
    graduated: results.filter((r) => r.graduated).length,
  };
}
