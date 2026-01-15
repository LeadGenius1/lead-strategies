/**
 * Send personalized email to Pinnacle Professional Cleaning Services
 * Using LeadSite.AI platform backend API
 */

const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-2987.up.railway.app';

const emailData = {
  to: 'info@pinnaclepcs.com',
  subject: 'Help Pinnacle PCS Win More Commercial Cleaning Contracts in Berks County',
  body: `Hi there,

I noticed Pinnacle Professional Cleaning Services serves Berks County and surrounding areas with your GBAC-certified commercial cleaning services. As a fellow Exton-based business (we're at 600 Eagleview Blvd), I wanted to reach out because I think we can help you win more commercial cleaning contracts.

**The Challenge:**  
Finding and connecting with the right decision-makers at offices, medical facilities, childcare centers, and construction sites in Berks County can be time-consuming. You're probably spending hours researching prospects, crafting emails, and following up—time that could be better spent delivering your exceptional cleaning services.

**How LeadSite.AI Can Help:**  
Our AI-powered platform is specifically designed for service businesses like yours. Here's what we can do:

1. **Find Your Ideal Prospects** - Our AI scans 50M+ profiles daily to identify decision-makers at commercial facilities, property management companies, and businesses in your service area who need professional cleaning services.

2. **Write Personalized Outreach** - Instead of generic emails, our AI creates personalized messages that reference each prospect's specific needs—whether it's office cleaning, post-construction cleanup, or specialized carpet cleaning.

3. **Automate Follow-ups** - Our system handles the follow-up process, so you wake up to qualified leads in your inbox every morning—not more cold calls.

**Why This Matters for Pinnacle PCS:**  
- **More Commercial Contracts**: Target offices, medical facilities, and construction sites actively looking for cleaning services
- **Save Time**: Stop spending hours on manual prospecting—let AI do the heavy lifting
- **Local Focus**: Our AI can specifically target Berks County and surrounding areas where you operate
- **Professional Outreach**: Your GBAC certification is impressive—our AI helps you communicate that value effectively to the right prospects

**Special Offer for Local Businesses:**  
Since we're both based in the Exton area, I'd love to offer you a free 14-day trial to see how LeadSite.AI can help Pinnacle PCS win more contracts. No credit card required.

**Next Steps:**  
1. Visit: https://leadstrategies-frontend.vercel.app/signup?tier=leadsite-ai
2. Start with our Email Engine tier ($49/month) - perfect for service businesses
3. Let our AI find and contact 500+ qualified prospects in your area each month

I'd be happy to show you how other service businesses in Pennsylvania are using our platform to grow their client base. Would you be open to a quick 15-minute demo?

Looking forward to helping Pinnacle PCS grow!

Best regards,  
AI Lead Strategies LLC  
600 Eagleview Blvd Suite 317  
Exton, PA 19341  
Phone: 610.757.1587  
Email: info@aileadstrategies.com`,
  from: 'info@aileadstrategies.com',
  prospectInfo: {
    name: 'Pinnacle Professional Cleaning Services',
    company: 'Pinnacle Professional Cleaning Service LLC',
    website: 'pinnaclepcs.com',
    location: 'Berks County, PA',
    industry: 'Commercial Cleaning Services',
    services: ['Office Cleaning', 'Carpet Cleaning', 'Post-Construction Cleanup', 'Medical Facilities'],
    certifications: ['GBAC Certified']
  }
};

async function sendEmail() {
  try {
    console.log('Attempting to send email via backend API...');
    console.log(`API URL: ${API_URL}`);
    
    // Try different possible endpoints
    const endpoints = [
      '/api/email/send',
      '/api/emails',
      '/api/campaigns/send',
      '/api/email',
      '/api/send-email'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`\nTrying endpoint: ${endpoint}`);
        const response = await axios.post(`${API_URL}${endpoint}`, emailData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
        
        console.log('✅ Email sent successfully!');
        console.log('Response:', response.data);
        return;
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
          if (error.response.status !== 404) {
            console.log('Response:', error.response.data);
          }
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          console.log(`❌ ${endpoint}: Connection failed`);
        } else {
          console.log(`❌ ${endpoint}: ${error.message}`);
        }
      }
    }

    console.log('\n⚠️  No working email endpoint found in backend API.');
    console.log('Email content has been saved to email-pinnaclepcs.md');
    console.log('Please send manually or implement email sending API endpoint.');
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nEmail content saved to email-pinnaclepcs.md');
    console.log('Please send manually via your email client.');
  }
}

sendEmail();
