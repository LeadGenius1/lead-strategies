import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import Stripe from 'stripe';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
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
    } catch {
      // JWT invalid/expired - fall through
    }
  }
  const session = await getSession();
  if (session?.user?.id) {
    return { id: session.user.id, email: session.user.email };
  }
  return null;
}

export async function POST(request) {
  try {
    const user = await getUserId(request);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { successUrl, cancelUrl } = await request.json();
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Additional Website',
              description: 'AI-generated website with hosting included',
            },
            unit_amount: 1999,
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        productType: 'additional_website',
      },
      customer_email: user.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[stripe/create-website-checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
