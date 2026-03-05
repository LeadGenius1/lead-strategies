// NEXUS Function (verified + wired): Send Email via Mailgun
// Wraps existing Mailgun service with transactional, bulk, and status capabilities
const { sendEmail: mailgunSend, DOMAIN } = require('../../services/mailgun');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const BATCH_SIZE = 100;

/**
 * Send a single transactional email
 */
async function sendTransactional({ to, subject, html, from }) {
  try {
    if (!to || !subject || !html) {
      return { success: false, error: 'to, subject, and html are required' };
    }

    const result = await mailgunSend({
      to,
      subject,
      body: html,
      from: from || `LeadSite.AI <noreply@${DOMAIN}>`
    });

    return result;
  } catch (error) {
    return { success: false, error: `Send transactional error: ${error.message}` };
  }
}

/**
 * Send bulk emails in batches of 100
 */
async function sendBulk({ recipients, subject, html, from }) {
  try {
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return { success: false, error: 'recipients array is required and must not be empty' };
    }
    if (!subject || !html) {
      return { success: false, error: 'subject and html are required' };
    }

    const results = [];
    const batches = [];

    // Split into batches of BATCH_SIZE
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      batches.push(recipients.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      const result = await mailgunSend({
        to: batch,
        subject,
        body: html,
        from: from || `LeadSite.AI <noreply@${DOMAIN}>`
      });
      results.push({
        batchSize: batch.length,
        success: result.success,
        messageId: result.messageId,
        error: result.error || null
      });
    }

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      totalRecipients: recipients.length,
      batchesSent: results.length,
      batchesSucceeded: successCount,
      batchesFailed: results.length - successCount,
      results
    };
  } catch (error) {
    return { success: false, error: `Send bulk error: ${error.message}` };
  }
}

/**
 * Get email delivery status via Mailgun Events API
 */
async function getEmailStatus(messageId) {
  try {
    if (!messageId) {
      return { success: false, error: 'messageId is required' };
    }

    if (!MAILGUN_API_KEY) {
      return { success: false, error: 'MAILGUN_API_KEY not configured' };
    }

    const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
    const encodedId = encodeURIComponent(messageId);
    const res = await fetch(
      `https://api.mailgun.net/v3/${DOMAIN}/events?message-id=${encodedId}`,
      {
        method: 'GET',
        headers: { 'Authorization': `Basic ${auth}` },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!res.ok) {
      return { success: false, error: `Mailgun API returned HTTP ${res.status}` };
    }

    const data = await res.json();
    const events = (data.items || []).map(e => ({
      event: e.event,
      timestamp: e.timestamp,
      recipient: e.recipient
    }));

    return {
      success: true,
      messageId,
      events,
      latestEvent: events.length > 0 ? events[0].event : 'unknown'
    };
  } catch (error) {
    return { success: false, error: `Email status error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches send_email actions
 */
async function sendEmailHandler(params) {
  const { action, to, recipients, subject, html, from, messageId } = params || {};

  switch (action) {
    case 'send_transactional':
      return await sendTransactional({ to, subject, html, from });
    case 'send_bulk':
      return await sendBulk({ recipients, subject, html, from });
    case 'get_status':
      return await getEmailStatus(messageId);
    default:
      return { error: `Unknown send_email action: ${action}` };
  }
}

module.exports = {
  sendTransactional,
  sendBulk,
  getEmailStatus,
  sendEmailHandler
};
