// Website Templates Library for LeadSite.IO
// 6 professional starter templates

import { WebsiteData } from './website-builder/types';

export const websiteTemplates: Record<string, WebsiteData> = {
  'saas-product-launch': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'Launch Your SaaS Product Faster',
              subtitle: 'Everything you need to go from idea to paying customers in days, not months.',
              ctaText: 'Start Free Trial',
              ctaLink: '#signup',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'Why Choose Us',
              subtitle: 'Built for modern SaaS teams',
              features: [
                {
                  icon: 'rocket',
                  title: 'Fast Setup',
                  description: 'Get started in minutes with our intuitive dashboard',
                },
                {
                  icon: 'shield',
                  title: 'Secure & Reliable',
                  description: 'Enterprise-grade security with 99.9% uptime',
                },
                {
                  icon: 'chart',
                  title: 'Analytics Built-In',
                  description: 'Track everything you need to grow your business',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'pricing',
            content: {
              title: 'Simple Pricing',
              subtitle: 'Choose the plan that works for you',
              plans: [
                {
                  name: 'Starter',
                  price: '$29',
                  period: '/mo',
                  features: ['Up to 1,000 users', 'Basic analytics', 'Email support'],
                  ctaText: 'Get Started',
                  ctaLink: '#signup',
                },
                {
                  name: 'Pro',
                  price: '$99',
                  period: '/mo',
                  features: ['Up to 10,000 users', 'Advanced analytics', 'Priority support'],
                  ctaText: 'Get Started',
                  ctaLink: '#signup',
                  highlighted: true,
                },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-4',
            type: 'cta',
            content: {
              title: 'Ready to Launch?',
              subtitle: 'Join thousands of SaaS companies already using our platform',
              ctaText: 'Start Free Trial',
              ctaLink: '#signup',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#1a1a1a',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#a855f7',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
  'lead-magnet-download': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'Download Your Free Guide',
              subtitle: 'Get instant access to our comprehensive guide and start growing your business today.',
              ctaText: 'Download Now',
              ctaLink: '#download',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'What You\'ll Learn',
              subtitle: 'Inside this guide',
              features: [
                {
                  icon: 'check',
                  title: 'Step-by-Step Process',
                  description: 'Follow our proven framework',
                },
                {
                  icon: 'check',
                  title: 'Real Examples',
                  description: 'See what works in practice',
                },
                {
                  icon: 'check',
                  title: 'Actionable Tips',
                  description: 'Start implementing today',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'contact',
            content: {
              title: 'Get Your Free Guide',
              subtitle: 'Enter your email to download',
              formFields: [
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'name', label: 'Name', type: 'text', required: true },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#6366f1',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
  'webinar-registration': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'Join Our Free Webinar',
              subtitle: 'Learn the secrets to growing your business from industry experts',
              ctaText: 'Register Now',
              ctaLink: '#register',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'What You\'ll Discover',
              subtitle: 'Key topics covered',
              features: [
                {
                  icon: 'calendar',
                  title: 'Date & Time',
                  description: 'Wednesday, March 15th at 2 PM EST',
                },
                {
                  icon: 'users',
                  title: 'Expert Speakers',
                  description: 'Learn from industry leaders',
                },
                {
                  icon: 'award',
                  title: 'Certificate',
                  description: 'Get a completion certificate',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'contact',
            content: {
              title: 'Reserve Your Spot',
              subtitle: 'Limited seats available',
              formFields: [
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'company', label: 'Company', type: 'text', required: false },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#ec4899',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
  'consultation-booking': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'Book Your Free Consultation',
              subtitle: 'Let\'s discuss how we can help grow your business',
              ctaText: 'Schedule Now',
              ctaLink: '#book',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'What to Expect',
              subtitle: 'In your consultation',
              features: [
                {
                  icon: 'clock',
                  title: '30 Minutes',
                  description: 'Focused discussion on your needs',
                },
                {
                  icon: 'target',
                  title: 'Custom Strategy',
                  description: 'Personalized recommendations',
                },
                {
                  icon: 'gift',
                  title: 'Free Resources',
                  description: 'Get actionable insights',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'contact',
            content: {
              title: 'Choose Your Time',
              subtitle: 'Select a time that works for you',
              formFields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'phone', label: 'Phone', type: 'tel', required: false },
                { name: 'date', label: 'Preferred Date', type: 'date', required: true },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#10b981',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
  'ebook-landing-page': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'The Ultimate Guide to Success',
              subtitle: 'Download our comprehensive eBook and transform your business',
              ctaText: 'Get Free eBook',
              ctaLink: '#download',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'What\'s Inside',
              subtitle: 'Chapter highlights',
              features: [
                {
                  icon: 'book',
                  title: '10 Chapters',
                  description: 'Comprehensive coverage',
                },
                {
                  icon: 'pages',
                  title: '100+ Pages',
                  description: 'In-depth content',
                },
                {
                  icon: 'star',
                  title: 'Expert Insights',
                  description: 'From industry leaders',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'testimonials',
            content: {
              title: 'What Readers Say',
              subtitle: 'Join thousands of satisfied readers',
              testimonials: [
                {
                  quote: 'This eBook changed how I approach my business.',
                  author: 'Sarah Johnson',
                  role: 'CEO, Tech Startup',
                },
                {
                  quote: 'Incredible insights packed into one resource.',
                  author: 'Michael Chen',
                  role: 'Marketing Director',
                },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-4',
            type: 'contact',
            content: {
              title: 'Get Your Free Copy',
              subtitle: 'Enter your details to download',
              formFields: [
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'name', label: 'Name', type: 'text', required: true },
              ],
            },
            settings: {
              backgroundColor: '#1a1a1a',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#f59e0b',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
  'portfolio-showcase': {
    pages: [
      {
        id: 'home',
        name: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            content: {
              title: 'Creative Portfolio',
              subtitle: 'Showcasing exceptional work and creative solutions',
              ctaText: 'View Work',
              ctaLink: '#portfolio',
              alignment: 'center',
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 80, bottom: 80 },
            },
          },
          {
            id: 'section-2',
            type: 'features',
            content: {
              title: 'Our Services',
              subtitle: 'What we offer',
              features: [
                {
                  icon: 'design',
                  title: 'Design',
                  description: 'Beautiful, modern designs',
                },
                {
                  icon: 'code',
                  title: 'Development',
                  description: 'Clean, efficient code',
                },
                {
                  icon: 'strategy',
                  title: 'Strategy',
                  description: 'Data-driven insights',
                },
              ],
              columns: 3,
            },
            settings: {
              backgroundColor: '#050505',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-3',
            type: 'testimonials',
            content: {
              title: 'Client Testimonials',
              subtitle: 'What our clients say',
              testimonials: [
                {
                  quote: 'Exceeded our expectations in every way.',
                  author: 'Client Name',
                  role: 'Company Name',
                },
                {
                  quote: 'Professional, creative, and results-driven.',
                  author: 'Client Name',
                  role: 'Company Name',
                },
              ],
            },
            settings: {
              backgroundColor: '#030303',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
          {
            id: 'section-4',
            type: 'contact',
            content: {
              title: 'Let\'s Work Together',
              subtitle: 'Get in touch to discuss your project',
              formFields: [
                { name: 'name', label: 'Name', type: 'text', required: true },
                { name: 'email', label: 'Email', type: 'email', required: true },
                { name: 'message', label: 'Message', type: 'textarea', required: true },
              ],
            },
            settings: {
              backgroundColor: '#1a1a1a',
              textColor: '#ffffff',
              padding: { top: 60, bottom: 60 },
            },
          },
        ],
      },
    ],
    settings: {
      primaryColor: '#06b6d4',
      secondaryColor: '#ffffff',
      fontFamily: 'default',
    },
  },
};

export const getTemplate = (templateId: string): WebsiteData | null => {
  return websiteTemplates[templateId] || null;
};

export const getAllTemplates = (): Array<{ id: string; name: string; description: string; data: WebsiteData }> => {
  return [
    {
      id: 'saas-product-launch',
      name: 'SaaS Product Launch',
      description: 'Perfect for launching your SaaS product with features, pricing, and CTA sections',
      data: websiteTemplates['saas-product-launch'],
    },
    {
      id: 'lead-magnet-download',
      name: 'Lead Magnet Download',
      description: 'Capture leads with a downloadable resource landing page',
      data: websiteTemplates['lead-magnet-download'],
    },
    {
      id: 'webinar-registration',
      name: 'Webinar Registration',
      description: 'Build anticipation and collect registrations for your webinar',
      data: websiteTemplates['webinar-registration'],
    },
    {
      id: 'consultation-booking',
      name: 'Consultation Booking',
      description: 'Let prospects book consultations directly from your landing page',
      data: websiteTemplates['consultation-booking'],
    },
    {
      id: 'ebook-landing-page',
      name: 'eBook Landing Page',
      description: 'Showcase and distribute your eBook with testimonials and download form',
      data: websiteTemplates['ebook-landing-page'],
    },
    {
      id: 'portfolio-showcase',
      name: 'Portfolio Showcase',
      description: 'Display your work and services with a professional portfolio layout',
      data: websiteTemplates['portfolio-showcase'],
    },
  ];
};
