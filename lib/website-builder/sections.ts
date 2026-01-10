// Section Templates and Definitions
// Pre-defined section templates for the website builder

import { SectionTemplate } from './types';

// Icon names for sections (using lucide-react icon names)
const SECTION_ICONS: Record<string, string> = {
  hero: 'target',
  features: 'sparkles',
  cta: 'megaphone',
  testimonials: 'message-square',
  contact: 'mail',
  pricing: 'dollar-sign',
  faq: 'help-circle',
};

const FEATURE_ICONS: Record<string, string> = {
  'fast': 'rocket',
  'reliable': 'rocket',
  'secure': 'shield',
  'scalable': 'trending-up',
};

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Large banner with headline and CTA',
    icon: 'target',
    defaultContent: {
      title: 'Welcome to Our Platform',
      subtitle: 'Build amazing landing pages in minutes',
      ctaText: 'Get Started',
      ctaLink: '#',
      backgroundImage: '',
      alignment: 'center',
    },
    defaultSettings: {
      backgroundColor: '#030303',
      textColor: '#ffffff',
      padding: { top: 80, bottom: 80 },
    },
  },
  {
    type: 'features',
    name: 'Features Section',
    description: 'Showcase your key features',
    icon: 'sparkles',
    defaultContent: {
      title: 'Key Features',
      subtitle: 'Everything you need to succeed',
      features: [
        {
          icon: 'rocket',
          title: 'Fast & Reliable',
          description: 'Lightning-fast performance',
        },
        {
          icon: 'shield',
          title: 'Secure',
          description: 'Enterprise-grade security',
        },
        {
          icon: 'trending-up',
          title: 'Scalable',
          description: 'Grows with your business',
        },
      ],
      columns: 3,
    },
    defaultSettings: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
  {
    type: 'cta',
    name: 'Call to Action',
    description: 'Encourage visitors to take action',
    icon: 'megaphone',
    defaultContent: {
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of satisfied customers',
      ctaText: 'Sign Up Now',
      ctaLink: '#',
      alignment: 'center',
    },
    defaultSettings: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    description: 'Show customer reviews',
    icon: 'message-square',
    defaultContent: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'John Doe',
          company: 'Acme Corp',
          quote: 'Amazing service! Highly recommended.',
          avatar: '',
        },
        {
          name: 'Jane Smith',
          company: 'Tech Inc',
          quote: 'Best platform we\'ve ever used.',
          avatar: '',
        },
      ],
    },
    defaultSettings: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
  {
    type: 'contact',
    name: 'Contact Form',
    description: 'Collect visitor information',
    icon: 'mail',
    defaultContent: {
      title: 'Get In Touch',
      subtitle: 'We\'d love to hear from you',
      fields: ['name', 'email', 'message'],
      submitText: 'Send Message',
    },
    defaultSettings: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
  {
    type: 'pricing',
    name: 'Pricing',
    description: 'Display pricing tiers',
    icon: 'dollar-sign',
    defaultContent: {
      title: 'Choose Your Plan',
      subtitle: 'Flexible pricing for every need',
      plans: [
        {
          name: 'Starter',
          price: '$29',
          period: '/month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          ctaText: 'Get Started',
        },
        {
          name: 'Pro',
          price: '$79',
          period: '/month',
          features: ['All Starter', 'Feature 4', 'Feature 5'],
          ctaText: 'Get Started',
          highlighted: true,
        },
      ],
    },
    defaultSettings: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Answer common questions',
    icon: 'help-circle',
    defaultContent: {
      title: 'Frequently Asked Questions',
      questions: [
        {
          question: 'How does it work?',
          answer: 'It\'s simple! Just sign up and start building.',
        },
        {
          question: 'Can I customize my site?',
          answer: 'Yes, you have full control over design and content.',
        },
      ],
    },
    defaultSettings: {
      backgroundColor: '#050505',
      textColor: '#ffffff',
      padding: { top: 60, bottom: 60 },
    },
  },
];

export function createSectionFromTemplate(template: SectionTemplate): import('./types').Section {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: template.type,
    content: { ...template.defaultContent },
    settings: { ...template.defaultSettings },
  };
}
