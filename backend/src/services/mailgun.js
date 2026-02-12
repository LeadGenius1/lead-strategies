// Mailgun Email Service - LeadSite.AI
// Uses Mailgun HTTP API (no extra deps)

const DOMAIN = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_DOMAIN_NAME || 'mail.leadsiteai.com';
const API_KEY = process.env.MAILGUN_API_KEY;

async function sendEmail({ to, subject, body, from, text }) {
  if (!API_KEY) {
    console.warn('MAILGUN_API_KEY not set - email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const auth = Buffer.from(`api:${API_KEY}`).toString('base64');
    const formData = new URLSearchParams();
    formData.append('from', from || `LeadSite.AI <noreply@${DOMAIN}>`);
    formData.append('to', Array.isArray(to) ? to.join(', ') : to);
    formData.append('subject', subject);
    formData.append('html', body || '');
    if (text) formData.append('text', text);

    const res = await fetch(`https://api.mailgun.net/v3/${DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Mailgun error:', data);
      return { success: false, error: data.message || 'Failed to send email', messageId: null };
    }

    return { success: true, messageId: data.id || null };
  } catch (error) {
    console.error('Mailgun error:', error);
    return { success: false, error: error.message, messageId: null };
  }
}

module.exports = { sendEmail, DOMAIN };
