import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const priceId = process.env.EMAIL_POOL_STRIPE_PRICE_ID || process.env.STRIPE_POOL_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: 'Pool subscription not configured' }, { status: 500 });
    }

    const existing = await prisma.emailPoolSubscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existing && ['ACTIVE', 'PAST_DUE'].includes(existing.status)) {
      return NextResponse.json({
        error: 'You already have an active pool subscription',
      }, { status: 409 });
    }

    let stripeCustomerId = existing?.stripeCustomerId;

    if (!stripeCustomerId) {
      const stripe = getStripe();
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: { userId: session.user.id },
      });
      stripeCustomerId = customer.id;
    }

    const subscription = await prisma.emailPoolSubscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        stripeCustomerId,
        status: 'PENDING',
      },
      update: {
        stripeCustomerId,
        status: 'PENDING',
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?pool=success`,
      cancel_url: `${appUrl}/settings?pool=canceled`,
      metadata: {
        userId: session.user.id,
        subscriptionDbId: subscription.id,
        type: 'email_pool',
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          subscriptionDbId: subscription.id,
          type: 'email_pool',
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Error creating pool checkout:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
