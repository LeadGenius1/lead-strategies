// Website Templates Routes (LeadSite.IO)
// 60 professional templates for AI website builder

const express = require('express');
const router = express.Router();

// 60 Website Templates
const templates = [
  // Business (1-10)
  { id: 1, name: 'Modern Business', category: 'business', thumbnail: '/templates/modern-business.png', sections: ['hero', 'services', 'about', 'testimonials', 'contact', 'footer'], colors: { primary: '#6366f1', secondary: '#8b5cf6' }, description: 'Clean, modern design for professional services' },
  { id: 2, name: 'Corporate Pro', category: 'business', thumbnail: '/templates/corporate-pro.png', sections: ['hero', 'features', 'team', 'pricing', 'contact', 'footer'], colors: { primary: '#1e40af', secondary: '#3b82f6' }, description: 'Professional corporate website' },
  { id: 3, name: 'Startup Launch', category: 'business', thumbnail: '/templates/startup-launch.png', sections: ['hero', 'problem', 'solution', 'features', 'cta', 'footer'], colors: { primary: '#7c3aed', secondary: '#a855f7' }, description: 'Perfect for startup launches' },
  { id: 4, name: 'Consulting Firm', category: 'business', thumbnail: '/templates/consulting.png', sections: ['hero', 'services', 'case-studies', 'team', 'contact', 'footer'], colors: { primary: '#0f766e', secondary: '#14b8a6' }, description: 'Professional consulting services' },
  { id: 5, name: 'Finance Solutions', category: 'business', thumbnail: '/templates/finance.png', sections: ['hero', 'services', 'stats', 'testimonials', 'contact', 'footer'], colors: { primary: '#0369a1', secondary: '#0ea5e9' }, description: 'Financial services and advisors' },
  { id: 6, name: 'Legal Practice', category: 'business', thumbnail: '/templates/legal.png', sections: ['hero', 'practice-areas', 'attorneys', 'testimonials', 'contact', 'footer'], colors: { primary: '#1e3a5f', secondary: '#475569' }, description: 'Law firms and legal services' },
  { id: 7, name: 'Real Estate Pro', category: 'business', thumbnail: '/templates/realestate.png', sections: ['hero', 'listings', 'services', 'testimonials', 'contact', 'footer'], colors: { primary: '#b45309', secondary: '#f59e0b' }, description: 'Real estate agencies' },
  { id: 8, name: 'Insurance Agency', category: 'business', thumbnail: '/templates/insurance.png', sections: ['hero', 'products', 'benefits', 'quote-form', 'contact', 'footer'], colors: { primary: '#0891b2', secondary: '#06b6d4' }, description: 'Insurance providers' },
  { id: 9, name: 'Accounting Firm', category: 'business', thumbnail: '/templates/accounting.png', sections: ['hero', 'services', 'team', 'testimonials', 'contact', 'footer'], colors: { primary: '#059669', secondary: '#10b981' }, description: 'Accounting and bookkeeping' },
  { id: 10, name: 'HR Services', category: 'business', thumbnail: '/templates/hr.png', sections: ['hero', 'services', 'process', 'testimonials', 'contact', 'footer'], colors: { primary: '#7c2d12', secondary: '#ea580c' }, description: 'HR consulting and recruitment' },

  // SaaS (11-20)
  { id: 11, name: 'SaaS Pro', category: 'saas', thumbnail: '/templates/saas-pro.png', sections: ['hero', 'features', 'pricing', 'faq', 'cta', 'footer'], colors: { primary: '#8b5cf6', secondary: '#a855f7' }, description: 'Modern SaaS product landing' },
  { id: 12, name: 'App Landing', category: 'saas', thumbnail: '/templates/app-landing.png', sections: ['hero', 'screenshots', 'features', 'testimonials', 'download', 'footer'], colors: { primary: '#6366f1', secondary: '#818cf8' }, description: 'Mobile app landing page' },
  { id: 13, name: 'Dashboard Preview', category: 'saas', thumbnail: '/templates/dashboard.png', sections: ['hero', 'demo', 'features', 'integrations', 'pricing', 'footer'], colors: { primary: '#0ea5e9', secondary: '#38bdf8' }, description: 'Product with dashboard preview' },
  { id: 14, name: 'API Platform', category: 'saas', thumbnail: '/templates/api.png', sections: ['hero', 'docs-preview', 'features', 'pricing', 'cta', 'footer'], colors: { primary: '#22c55e', secondary: '#4ade80' }, description: 'API and developer tools' },
  { id: 15, name: 'Analytics Tool', category: 'saas', thumbnail: '/templates/analytics.png', sections: ['hero', 'features', 'charts', 'pricing', 'cta', 'footer'], colors: { primary: '#f43f5e', secondary: '#fb7185' }, description: 'Analytics and reporting tools' },
  { id: 16, name: 'CRM Software', category: 'saas', thumbnail: '/templates/crm.png', sections: ['hero', 'features', 'integrations', 'pricing', 'testimonials', 'footer'], colors: { primary: '#3b82f6', secondary: '#60a5fa' }, description: 'CRM and sales tools' },
  { id: 17, name: 'Project Management', category: 'saas', thumbnail: '/templates/project.png', sections: ['hero', 'features', 'use-cases', 'pricing', 'cta', 'footer'], colors: { primary: '#8b5cf6', secondary: '#a78bfa' }, description: 'Project management software' },
  { id: 18, name: 'Communication Tool', category: 'saas', thumbnail: '/templates/communication.png', sections: ['hero', 'features', 'security', 'pricing', 'cta', 'footer'], colors: { primary: '#06b6d4', secondary: '#22d3ee' }, description: 'Team communication tools' },
  { id: 19, name: 'AI Product', category: 'saas', thumbnail: '/templates/ai-product.png', sections: ['hero', 'demo', 'features', 'use-cases', 'pricing', 'footer'], colors: { primary: '#7c3aed', secondary: '#a855f7' }, description: 'AI-powered products' },
  { id: 20, name: 'Security Software', category: 'saas', thumbnail: '/templates/security.png', sections: ['hero', 'features', 'compliance', 'pricing', 'cta', 'footer'], colors: { primary: '#0f172a', secondary: '#334155' }, description: 'Security and compliance tools' },

  // Portfolio (21-28)
  { id: 21, name: 'Creative Portfolio', category: 'portfolio', thumbnail: '/templates/creative-portfolio.png', sections: ['hero', 'work', 'about', 'contact', 'footer'], colors: { primary: '#ec4899', secondary: '#f472b6' }, description: 'Designer and artist portfolio' },
  { id: 22, name: 'Minimal Folio', category: 'portfolio', thumbnail: '/templates/minimal-folio.png', sections: ['hero', 'projects', 'skills', 'contact', 'footer'], colors: { primary: '#18181b', secondary: '#71717a' }, description: 'Minimalist portfolio' },
  { id: 23, name: 'Developer Portfolio', category: 'portfolio', thumbnail: '/templates/developer.png', sections: ['hero', 'projects', 'skills', 'github', 'contact', 'footer'], colors: { primary: '#22c55e', secondary: '#4ade80' }, description: 'Software developer portfolio' },
  { id: 24, name: 'Photographer', category: 'portfolio', thumbnail: '/templates/photographer.png', sections: ['hero', 'gallery', 'services', 'about', 'contact', 'footer'], colors: { primary: '#0f0f0f', secondary: '#525252' }, description: 'Photography portfolio' },
  { id: 25, name: 'Video Producer', category: 'portfolio', thumbnail: '/templates/video.png', sections: ['hero', 'showreel', 'work', 'clients', 'contact', 'footer'], colors: { primary: '#dc2626', secondary: '#f87171' }, description: 'Video and film portfolio' },
  { id: 26, name: 'UX Designer', category: 'portfolio', thumbnail: '/templates/ux.png', sections: ['hero', 'case-studies', 'process', 'about', 'contact', 'footer'], colors: { primary: '#6366f1', secondary: '#818cf8' }, description: 'UX/UI designer portfolio' },
  { id: 27, name: 'Writer Portfolio', category: 'portfolio', thumbnail: '/templates/writer.png', sections: ['hero', 'samples', 'services', 'testimonials', 'contact', 'footer'], colors: { primary: '#0d9488', secondary: '#2dd4bf' }, description: 'Freelance writer portfolio' },
  { id: 28, name: 'Architect', category: 'portfolio', thumbnail: '/templates/architect.png', sections: ['hero', 'projects', 'services', 'awards', 'contact', 'footer'], colors: { primary: '#78716c', secondary: '#a8a29e' }, description: 'Architecture firm portfolio' },

  // Agency (29-36)
  { id: 29, name: 'Digital Agency', category: 'agency', thumbnail: '/templates/digital-agency.png', sections: ['hero', 'services', 'portfolio', 'team', 'contact', 'footer'], colors: { primary: '#f43f5e', secondary: '#fb7185' }, description: 'Full-service digital agency' },
  { id: 30, name: 'Marketing Agency', category: 'agency', thumbnail: '/templates/marketing-agency.png', sections: ['hero', 'services', 'case-studies', 'team', 'contact', 'footer'], colors: { primary: '#f97316', secondary: '#fb923c' }, description: 'Marketing and advertising' },
  { id: 31, name: 'Creative Studio', category: 'agency', thumbnail: '/templates/creative-studio.png', sections: ['hero', 'work', 'services', 'about', 'contact', 'footer'], colors: { primary: '#a855f7', secondary: '#c084fc' }, description: 'Creative design studio' },
  { id: 32, name: 'SEO Agency', category: 'agency', thumbnail: '/templates/seo.png', sections: ['hero', 'services', 'results', 'pricing', 'contact', 'footer'], colors: { primary: '#059669', secondary: '#34d399' }, description: 'SEO and growth agency' },
  { id: 33, name: 'PR Agency', category: 'agency', thumbnail: '/templates/pr.png', sections: ['hero', 'services', 'clients', 'press', 'contact', 'footer'], colors: { primary: '#1e40af', secondary: '#3b82f6' }, description: 'Public relations firm' },
  { id: 34, name: 'Branding Agency', category: 'agency', thumbnail: '/templates/branding.png', sections: ['hero', 'services', 'portfolio', 'process', 'contact', 'footer'], colors: { primary: '#7c3aed', secondary: '#8b5cf6' }, description: 'Branding and identity' },
  { id: 35, name: 'Web Design Agency', category: 'agency', thumbnail: '/templates/webdesign.png', sections: ['hero', 'services', 'portfolio', 'pricing', 'contact', 'footer'], colors: { primary: '#2563eb', secondary: '#3b82f6' }, description: 'Web design services' },
  { id: 36, name: 'Content Agency', category: 'agency', thumbnail: '/templates/content.png', sections: ['hero', 'services', 'samples', 'pricing', 'contact', 'footer'], colors: { primary: '#0891b2', secondary: '#06b6d4' }, description: 'Content creation agency' },

  // Restaurant & Food (37-44)
  { id: 37, name: 'Restaurant Starter', category: 'restaurant', thumbnail: '/templates/restaurant.png', sections: ['hero', 'menu', 'about', 'reservations', 'contact', 'footer'], colors: { primary: '#b45309', secondary: '#f59e0b' }, description: 'Restaurant and dining' },
  { id: 38, name: 'Cafe & Bakery', category: 'restaurant', thumbnail: '/templates/cafe.png', sections: ['hero', 'menu', 'gallery', 'about', 'contact', 'footer'], colors: { primary: '#78350f', secondary: '#a16207' }, description: 'Coffee shop and bakery' },
  { id: 39, name: 'Fine Dining', category: 'restaurant', thumbnail: '/templates/fine-dining.png', sections: ['hero', 'menu', 'chef', 'reservations', 'contact', 'footer'], colors: { primary: '#1c1917', secondary: '#44403c' }, description: 'Upscale restaurant' },
  { id: 40, name: 'Food Truck', category: 'restaurant', thumbnail: '/templates/food-truck.png', sections: ['hero', 'menu', 'locations', 'catering', 'contact', 'footer'], colors: { primary: '#dc2626', secondary: '#f87171' }, description: 'Food truck business' },
  { id: 41, name: 'Pizza Shop', category: 'restaurant', thumbnail: '/templates/pizza.png', sections: ['hero', 'menu', 'order', 'locations', 'contact', 'footer'], colors: { primary: '#b91c1c', secondary: '#ef4444' }, description: 'Pizza restaurant' },
  { id: 42, name: 'Sushi Restaurant', category: 'restaurant', thumbnail: '/templates/sushi.png', sections: ['hero', 'menu', 'gallery', 'reservations', 'contact', 'footer'], colors: { primary: '#0f172a', secondary: '#dc2626' }, description: 'Japanese cuisine' },
  { id: 43, name: 'Bar & Lounge', category: 'restaurant', thumbnail: '/templates/bar.png', sections: ['hero', 'menu', 'events', 'gallery', 'contact', 'footer'], colors: { primary: '#1e1b4b', secondary: '#7c3aed' }, description: 'Bar and nightlife' },
  { id: 44, name: 'Food Delivery', category: 'restaurant', thumbnail: '/templates/delivery.png', sections: ['hero', 'menu', 'order', 'app-download', 'contact', 'footer'], colors: { primary: '#ea580c', secondary: '#f97316' }, description: 'Food delivery service' },

  // E-commerce (45-52)
  { id: 45, name: 'Fashion Store', category: 'ecommerce', thumbnail: '/templates/fashion.png', sections: ['hero', 'products', 'collections', 'about', 'footer'], colors: { primary: '#18181b', secondary: '#71717a' }, description: 'Fashion and apparel' },
  { id: 46, name: 'Tech Store', category: 'ecommerce', thumbnail: '/templates/tech-store.png', sections: ['hero', 'products', 'featured', 'reviews', 'footer'], colors: { primary: '#0f172a', secondary: '#3b82f6' }, description: 'Electronics and gadgets' },
  { id: 47, name: 'Beauty Products', category: 'ecommerce', thumbnail: '/templates/beauty.png', sections: ['hero', 'products', 'ingredients', 'testimonials', 'footer'], colors: { primary: '#be185d', secondary: '#ec4899' }, description: 'Beauty and skincare' },
  { id: 48, name: 'Furniture Store', category: 'ecommerce', thumbnail: '/templates/furniture.png', sections: ['hero', 'products', 'rooms', 'about', 'footer'], colors: { primary: '#78716c', secondary: '#a8a29e' }, description: 'Home furniture' },
  { id: 49, name: 'Jewelry Store', category: 'ecommerce', thumbnail: '/templates/jewelry.png', sections: ['hero', 'products', 'collections', 'about', 'footer'], colors: { primary: '#854d0e', secondary: '#ca8a04' }, description: 'Fine jewelry' },
  { id: 50, name: 'Sports Store', category: 'ecommerce', thumbnail: '/templates/sports.png', sections: ['hero', 'products', 'categories', 'reviews', 'footer'], colors: { primary: '#166534', secondary: '#22c55e' }, description: 'Sports equipment' },
  { id: 51, name: 'Book Store', category: 'ecommerce', thumbnail: '/templates/books.png', sections: ['hero', 'products', 'genres', 'reviews', 'footer'], colors: { primary: '#7c2d12', secondary: '#c2410c' }, description: 'Books and literature' },
  { id: 52, name: 'Pet Store', category: 'ecommerce', thumbnail: '/templates/pets.png', sections: ['hero', 'products', 'categories', 'blog', 'footer'], colors: { primary: '#0d9488', secondary: '#14b8a6' }, description: 'Pet supplies' },

  // Health & Wellness (53-60)
  { id: 53, name: 'Medical Clinic', category: 'health', thumbnail: '/templates/medical.png', sections: ['hero', 'services', 'doctors', 'appointments', 'contact', 'footer'], colors: { primary: '#0891b2', secondary: '#06b6d4' }, description: 'Healthcare clinic' },
  { id: 54, name: 'Dental Practice', category: 'health', thumbnail: '/templates/dental.png', sections: ['hero', 'services', 'team', 'appointments', 'contact', 'footer'], colors: { primary: '#0284c7', secondary: '#38bdf8' }, description: 'Dental office' },
  { id: 55, name: 'Fitness Gym', category: 'health', thumbnail: '/templates/gym.png', sections: ['hero', 'classes', 'trainers', 'membership', 'contact', 'footer'], colors: { primary: '#dc2626', secondary: '#f87171' }, description: 'Fitness center' },
  { id: 56, name: 'Yoga Studio', category: 'health', thumbnail: '/templates/yoga.png', sections: ['hero', 'classes', 'instructors', 'schedule', 'contact', 'footer'], colors: { primary: '#7c3aed', secondary: '#a78bfa' }, description: 'Yoga and meditation' },
  { id: 57, name: 'Spa & Wellness', category: 'health', thumbnail: '/templates/spa.png', sections: ['hero', 'services', 'packages', 'booking', 'contact', 'footer'], colors: { primary: '#0d9488', secondary: '#5eead4' }, description: 'Spa treatments' },
  { id: 58, name: 'Mental Health', category: 'health', thumbnail: '/templates/mental-health.png', sections: ['hero', 'services', 'approach', 'appointments', 'contact', 'footer'], colors: { primary: '#4f46e5', secondary: '#818cf8' }, description: 'Therapy and counseling' },
  { id: 59, name: 'Nutrition Coach', category: 'health', thumbnail: '/templates/nutrition.png', sections: ['hero', 'services', 'programs', 'testimonials', 'contact', 'footer'], colors: { primary: '#16a34a', secondary: '#4ade80' }, description: 'Nutrition services' },
  { id: 60, name: 'Veterinary Clinic', category: 'health', thumbnail: '/templates/vet.png', sections: ['hero', 'services', 'team', 'appointments', 'contact', 'footer'], colors: { primary: '#0891b2', secondary: '#22d3ee' }, description: 'Pet healthcare' }
];

// Get template categories
const categories = [
  { id: 'business', name: 'Business', count: 10 },
  { id: 'saas', name: 'SaaS', count: 10 },
  { id: 'portfolio', name: 'Portfolio', count: 8 },
  { id: 'agency', name: 'Agency', count: 8 },
  { id: 'restaurant', name: 'Restaurant & Food', count: 8 },
  { id: 'ecommerce', name: 'E-commerce', count: 8 },
  { id: 'health', name: 'Health & Wellness', count: 8 }
];

// GET /api/v1/templates - List all templates
router.get('/', (req, res) => {
  const { category, search, limit, offset } = req.query;

  let filtered = [...templates];

  // Filter by category
  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  // Search by name or description
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.description.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = filtered.length;
  const offsetNum = parseInt(offset) || 0;
  const limitNum = parseInt(limit) || 60;

  filtered = filtered.slice(offsetNum, offsetNum + limitNum);

  res.json({
    success: true,
    data: {
      templates: filtered,
      categories,
      total,
      limit: limitNum,
      offset: offsetNum
    }
  });
});

// GET /api/v1/templates/categories - List categories
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: categories
  });
});

// GET /api/v1/templates/:id - Get template details
router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === parseInt(req.params.id));

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  res.json({
    success: true,
    data: template
  });
});

// GET /api/v1/templates/:id/preview - Get template preview HTML
router.get('/:id/preview', (req, res) => {
  const template = templates.find(t => t.id === parseInt(req.params.id));

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Template not found'
    });
  }

  // Generate preview HTML based on template sections
  const previewHtml = generatePreviewHtml(template);

  res.json({
    success: true,
    data: {
      template,
      html: previewHtml
    }
  });
});

// Helper function to generate preview HTML
function generatePreviewHtml(template) {
  const sectionHtml = {
    hero: `<section class="hero" style="background: linear-gradient(135deg, ${template.colors.primary}, ${template.colors.secondary}); padding: 100px 20px; text-align: center; color: white;"><h1 style="font-size: 3rem; margin-bottom: 20px;">Your Business Name</h1><p style="font-size: 1.25rem; opacity: 0.9;">Compelling tagline that captures attention</p><button style="margin-top: 30px; padding: 15px 30px; background: white; color: ${template.colors.primary}; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer;">Get Started</button></section>`,
    services: `<section class="services" style="padding: 80px 20px; background: #f9fafb;"><div style="max-width: 1200px; margin: 0 auto;"><h2 style="text-align: center; font-size: 2rem; margin-bottom: 50px;">Our Services</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;"><div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h3>Service One</h3><p style="color: #666;">Description of your first service offering.</p></div><div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h3>Service Two</h3><p style="color: #666;">Description of your second service offering.</p></div><div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"><h3>Service Three</h3><p style="color: #666;">Description of your third service offering.</p></div></div></div></section>`,
    about: `<section class="about" style="padding: 80px 20px;"><div style="max-width: 800px; margin: 0 auto; text-align: center;"><h2 style="font-size: 2rem; margin-bottom: 30px;">About Us</h2><p style="color: #666; line-height: 1.8;">Tell your story here. What makes your business unique? Why should customers choose you?</p></div></section>`,
    contact: `<section class="contact" style="padding: 80px 20px; background: #f9fafb;"><div style="max-width: 600px; margin: 0 auto; text-align: center;"><h2 style="font-size: 2rem; margin-bottom: 30px;">Get In Touch</h2><form style="display: flex; flex-direction: column; gap: 20px;"><input type="text" placeholder="Name" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;"/><input type="email" placeholder="Email" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;"/><textarea placeholder="Message" rows="4" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;"></textarea><button type="submit" style="padding: 15px; background: ${template.colors.primary}; color: white; border: none; border-radius: 8px; cursor: pointer;">Send Message</button></form></div></section>`,
    footer: `<footer style="padding: 40px 20px; background: #18181b; color: white; text-align: center;"><p>&copy; 2026 Your Business. All rights reserved.</p></footer>`
  };

  const sections = template.sections.map(s => sectionHtml[s] || '').join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>* { margin: 0; padding: 0; box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }</style></head><body>${sections}</body></html>`;
}

module.exports = router;
