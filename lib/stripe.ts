import Stripe from 'stripe';

// Initialize Stripe (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe pricing tiers
export const STRIPE_PLANS = {
  'leadsite-ai': {
    name: 'LeadSite.AI',
    price: 49,
    priceId: process.env.STRIPE_PRICE_LEADSITE_AI || '',
    features: [
      '500 Prospects/Month',
      '3 Email Campaigns',
      'AI-Generated Content',
      '1 Website Analysis',
    ],
  },
  'leadsite-io': {
    name: 'LeadSite.IO',
    price: 29,
    priceId: process.env.STRIPE_PRICE_LEADSITE_IO || '',
    features: [
      '3 Websites',
      'AI Site Generator',
      'Lead Forms + Analytics',
      'Mobile-Optimized',
    ],
  },
  'clientcontact-io': {
    name: 'ClientContact.IO',
    price: 149,
    priceId: process.env.STRIPE_PRICE_CLIENTCONTACT_IO || '',
    features: [
      '22+ Channels Unified',
      'AI Auto-Responder',
      'Unlimited Campaigns',
      '3 Team Seats',
    ],
  },
  'tackle-io': {
    name: 'Tackle.IO',
    price: 499,
    priceId: process.env.STRIPE_PRICE_TACKLE_IO || '',
    features: [
      'Voice Calling (Twilio)',
      'Full CRM + Pipeline',
      '7 AI Agents',
      'Unlimited Team',
    ],
  },
};

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  tier: string,
  email: string
): Promise<Stripe.Checkout.Session> {
  const plan = STRIPE_PLANS[tier as keyof typeof STRIPE_PLANS];
  
  if (!plan || !plan.priceId) {
    throw new Error('Invalid tier or price ID not configured');
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
    metadata: {
      userId,
      tier,
    },
  });

  return session;
}

// Create customer portal session
export async function createPortalSession(
  customerId: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/billing`,
  });

  return session;
}

// Get subscription by customer ID
export async function getSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    console.error('Get subscription error:', error);
    return null;
  }
}
