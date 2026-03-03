// ═══════════════════════════════════════════════════════════════
// EXECUTOR — SMS (Twilio)
// Fully functional: sends SMS via Twilio REST API.
// Same pattern as backend/src/routes/sms.js.
// ═══════════════════════════════════════════════════════════════

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send an SMS message via Twilio.
 *
 * @param {object} payload
 * @param {string} payload.to - Recipient phone number (E.164 format)
 * @param {string} payload.body - SMS message body (max 1600 chars)
 * @returns {Promise<object>}
 */
async function sendSMS({ to, body }) {
  if (!to || !body) {
    return { status: 'failed', error: 'to and body are required' };
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { status: 'failed', error: 'Twilio credentials not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const params = new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: body.slice(0, 1600),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return { status: 'failed', error: data.message || 'Twilio API error', code: data.code };
    }

    return {
      status: 'completed',
      messageSid: data.sid,
      to: data.to,
      twilioStatus: data.status,
    };
  } catch (err) {
    return { status: 'failed', error: `SMS send failed: ${err.message}` };
  }
}

/**
 * Send SMS to multiple recipients.
 *
 * @param {object} payload
 * @param {Array<string>} payload.recipients - Phone numbers
 * @param {string} payload.body - SMS message body
 * @returns {Promise<object>}
 */
async function broadcastSMS({ recipients = [], body }) {
  if (recipients.length === 0 || !body) {
    return { status: 'failed', error: 'recipients and body are required' };
  }

  const results = [];
  for (const to of recipients) {
    const result = await sendSMS({ to, body });
    results.push({ to, ...result });
    // Small delay between sends to respect rate limits
    if (recipients.length > 1) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const sent = results.filter(r => r.status === 'completed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  return {
    status: failed === results.length ? 'failed' : 'completed',
    sent,
    failed,
    total: recipients.length,
    results,
  };
}

module.exports = { sendSMS, broadcastSMS };
