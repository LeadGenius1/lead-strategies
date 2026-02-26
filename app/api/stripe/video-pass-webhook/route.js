import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(key);
}

const webhookSecret = process.env.VIDEO_PASS_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing webhook config' }, { status: 400 });
    }

    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Video Pass Webhook] Signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.metadata?.productType === 'video_pass') {
        const userId = session.metadata.userId;
        if (userId) {
          await prisma.viewerPass.create({
            data: {
              userId,
              stripePaymentId: session.payment_intent,
              viewsTotal: 10,
              viewsRemaining: 10,
              amountPaid: 12.00,
              status: 'active',
            },
          });
          console.log(`[Video Pass Webhook] Created ViewerPass for user ${userId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Video Pass Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
