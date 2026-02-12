// AI Lead Strategies Platform Pricing Configuration
// ONLY update pricing data here - NO component changes

export const PRICING_CONFIG = {
  leadsite_ai: {
    productName: 'LeadSite.AI',
    startingPrice: 49,
    tiers: [
      {
        name: 'Starter',
        price: 49,
        popular: false,
        features: [
          '500 leads/month',
          '5 email campaigns',
          '2,500 emails/month',
          'Lead Discovery',
          'Analytics',
          '1 team seat'
        ]
      },
      {
        name: 'Professional',
        price: 149,
        popular: true,
        features: [
          '2,500 leads/month',
          '20 email campaigns',
          '12,500 emails/month',
          'Advanced filtering',
          '3 team seats'
        ]
      },
      {
        name: 'Business',
        price: 349,
        popular: false,
        features: [
          '7,500 leads/month',
          '50 email campaigns',
          '37,500 emails/month',
          'Priority support',
          '10 team seats'
        ]
      }
    ]
  },

  leadsite_io: {
    productName: 'LeadSite.IO',
    startingPrice: 49, // No free tier
    websitesPerTier: 1, // 1 website on ALL tiers
    tiers: [
      {
        name: 'Starter',
        price: 49,
        popular: false,
        features: [
          '1 website',
          '500 lead credits/month',
          'All templates',
          'Custom domain',
          'Basic SEO tools',
          'Email support'
        ],
        limits: {
          websites: 1,
          leadCredits: 500
        }
      },
      {
        name: 'Professional',
        price: 149,
        popular: true,
        features: [
          '1 website',
          '2,500 lead credits/month',
          'All templates',
          'Custom domain',
          'Advanced SEO tools',
          'A/B testing',
          'Priority support'
        ],
        limits: {
          websites: 1,
          leadCredits: 2500
        }
      },
      {
        name: 'Business',
        price: 349,
        popular: false,
        features: [
          '1 website',
          '10,000 lead credits/month',
          'All templates',
          'White-label options',
          'API access',
          'Priority support'
        ],
        limits: {
          websites: 1,
          leadCredits: 10000
        }
      }
    ]
  },

  clientcontact: {
    productName: 'ClientContact.IO',
    startingPrice: 99,
    tiers: [
      {
        name: 'Starter',
        price: 99,
        popular: false,
        features: [
          '22+ channel unified inbox',
          'AI auto-responder',
          'Unlimited campaigns',
          '3 team seats',
          'Sentiment analysis',
          'Reply suggestions',
          'Basic analytics'
        ]
      },
      {
        name: 'Professional',
        price: 149,
        popular: true,
        features: [
          'Everything in Starter',
          '10 team seats',
          'Advanced analytics',
          'Custom workflows',
          'Priority routing',
          'API access'
        ]
      },
      {
        name: 'Business',
        price: 399,
        popular: false,
        features: [
          'Everything in Professional',
          '25 team seats',
          'Dedicated success manager',
          'SLA guarantees',
          'Advanced automation',
          'Custom integrations'
        ]
      }
    ]
  },

  clientcontactCrm: {
    productName: 'ClientContact.IO',
    startingPrice: 79,
    tiers: [
      {
        name: 'Starter',
        price: 79,
        popular: false,
        features: [
          'Full CRM features',
          '2 AI agents active',
          '2,500 contacts',
          '5 team seats',
          'Email & SMS campaigns',
          'Basic automation',
          'Standard reporting'
        ]
      },
      {
        name: 'Professional',
        price: 299,
        popular: true,
        features: [
          'Full CRM features',
          '5 AI agents active',
          '10,000 contacts',
          '15 team seats',
          'Advanced automation',
          'Advanced reporting',
          'Custom fields',
          'API access'
        ]
      },
      {
        name: 'Business',
        price: 699,
        popular: false,
        features: [
          'Full CRM features',
          'All 7 AI agents active',
          '50,000 contacts',
          '50 team seats',
          'Advanced automation',
          'Advanced reporting',
          'Custom integrations',
          'Priority support'
        ]
      },
      {
        name: 'Enterprise',
        price: 1497,
        popular: false,
        features: [
          'Full CRM features',
          'All 7 AI agents (unlimited)',
          'Unlimited contacts',
          'Unlimited team seats',
          'Full API access',
          'White-label options',
          'Dedicated account manager',
          'Custom integrations'
        ]
      }
    ]
  },

  videosite: {
    productName: 'VideoSite.AI',
    startingPrice: 0,
    isFree: true,
    tiers: [
      {
        name: 'Creator',
        price: 0,
        popular: true,
        features: [
          '✅ Unlimited video hosting',
          '✅ Custom branded website',
          '✅ Advanced analytics',
          '✅ Subscriber management',
          '✅ Content scheduling',
          '✅ Monetization tools',
          '✅ Live streaming',
          '✅ 0% platform fees',
          '✅ All features included'
        ]
      }
    ]
  }
};

// Helper function to get pricing for a product
export function getProductPricing(productKey) {
  return PRICING_CONFIG[productKey] || null;
}

// Helper function to get a specific tier
export function getTier(productKey, tierName) {
  const product = PRICING_CONFIG[productKey];
  if (!product) return null;
  
  return product.tiers.find(
    tier => tier.name.toLowerCase() === tierName.toLowerCase()
  );
}

// Helper function to format price
export function formatPrice(price) {
  if (price === 0) return 'FREE';
  return `$${price.toLocaleString()}`;
}
