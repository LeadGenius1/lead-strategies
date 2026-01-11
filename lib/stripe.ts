import Stripe from 'stripe';

// Initialize Stripe (server-side only) - lazy initialization to avoid build errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Stripe pricing tiers
export const STRIPE_PLANS = {
  'leadsite-ai': {
    name: 'LeadSite.AI',
    price: 49,
    priceId: process.env.STRIPE_PRICE_LEADSITE_AI || '',
    features: [
      '1,000 Leads/Month',
      'Email Campaigns',
      'AI-Generated Content',
      'Lead Scoring & Analytics',
    ],
  },
  'leadsite-io': {
    name: 'LeadSite.IO',
    price: 49,
    priceId: process.env.STRIPE_PRICE_LEADSITE_IO || '',
    features: [
      '1,000 Leads/Month',
      '1 Free Website Built by AI',
      'AI Site Generator',
      'Lead Forms + Analytics',
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
    price: 249,
    priceId: process.env.STRIPE_PRICE_TACKLE_IO || '',
    features: [
      '2,000 Leads/Month',
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
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }
  
  const plan = STRIPE_PLANS[tier as keyof typeof STRIPE_PLANS];
  
  if (!plan || !plan.priceId) {
    throw new Error('Invalid tier or price ID not configured');
  }

  const session = await stripeInstance.checkout.sessions.create({
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
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    throw new Error('Stripe not configured');
  }
  
  const session = await stripeInstance.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard/billing`,
  });

  return session;
}

// Get subscription by customer ID
export async function getSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  const stripeInstance = getStripe();
  if (!stripeInstance) {
    return null;
  }
  
  try {
    const subscriptions = await stripeInstance.subscriptions.list({
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
