// SEPARATE webhook for email pool - DO NOT modify existing webhooks
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { provisionPoolEmails, deprovisionPoolEmails } from '@/lib/email-pool/pool-manager';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key);
}

const webhookSecret = process.env.EMAIL_POOL_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook config' }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error('[Pool Webhook] Signature verification failed:', message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type !== 'email_pool') break;

        const userId = session.metadata.userId;
        const subscriptionDbId = session.metadata.subscriptionDbId;
        const stripeSubId = session.subscription as string;
        if (!userId || !subscriptionDbId || !stripeSubId) break;

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const sub = stripeSub as unknown as { current_period_start: number; current_period_end: number };
        await prisma.emailPoolSubscription.update({
          where: { id: subscriptionDbId },
          data: {
            stripeSubscriptionId: stripeSubId,
            stripePriceId: process.env.EMAIL_POOL_STRIPE_PRICE_ID || undefined,
            status: 'ACTIVE',
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });

        await provisionPoolEmails(userId, subscriptionDbId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as unknown as Stripe.Subscription & { current_period_start?: number; current_period_end?: number };
        if (sub.metadata?.type !== 'email_pool') break;

        const dbSub = await prisma.emailPoolSubscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (dbSub && sub.current_period_start != null && sub.current_period_end != null) {
          await prisma.emailPoolSubscription.update({
            where: { id: dbSub.id },
            data: {
              status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'past_due' ? 'PAST_DUE' : dbSub.status,
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata?.type !== 'email_pool') break;

        const dbSub = await prisma.emailPoolSubscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (dbSub) {
          await prisma.emailPoolSubscription.update({
            where: { id: dbSub.id },
            data: { status: 'EXPIRED' },
          });
          await deprovisionPoolEmails(dbSub.userId, dbSub.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as Stripe.Invoice & { subscription?: string };
        const stripeSubId = typeof invoice.subscription === 'string' ? invoice.subscription : undefined;
        if (stripeSubId) {
          const dbSub = await prisma.emailPoolSubscription.findFirst({
            where: { stripeSubscriptionId: stripeSubId },
          });
          if (dbSub) {
            await prisma.emailPoolSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'PAST_DUE' },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Pool Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
