import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import Stripe from 'stripe';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function getUserId(request) {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value || cookieStore.get('admin_token')?.value;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const id = decoded.id || decoded.userId || decoded.sub;
      if (id) return { id, email: decoded.email };
    } catch {}
  }
  const session = await getSession();
  if (session?.user?.id) return { id: session.user.id, email: session.user.email };
  return null;
}

export async function POST(request) {
  try {
    const user = await getUserId(request);
    if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aileadstrategies.com';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'VideoSite.AI Viewer Pass', description: '10 video views' },
          unit_amount: 1200,
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/watch?pass_activated=true`,
      cancel_url: `${baseUrl}/watch`,
      metadata: { userId: user.id, productType: 'video_pass' },
      customer_email: user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[stripe/create-video-pass-checkout] Error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
