// SMS Marketing Routes (Twilio)
const express = require('express');
const { authenticate } = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Helper: send a single SMS via Twilio REST API (native fetch, no SDK)
async function sendTwilioSms(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!accountSid || !authToken || !messagingServiceSid) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        MessagingServiceSid: messagingServiceSid,
        To: to,
        Body: message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.message || 'Twilio API error', code: data.code };
  }

  return { success: true, messageSid: data.sid, to: data.to };
}

// Helper: replace template variables in message
function replaceTemplateVars(message, contact, company) {
  let result = message;
  result = result.replace(/\{\{firstName\}\}/g, contact.firstName || '');
  result = result.replace(/\{\{lastName\}\}/g, contact.lastName || '');
  result = result.replace(/\{\{companyName\}\}/g, company?.name || '');
  return result;
}

// --- Authenticated routes ---
router.use('/send', authenticate);
router.use('/broadcast', authenticate);
router.use('/sequence', authenticate);
router.use('/inbox', authenticate);

// POST /api/v1/sms/send - Send single SMS
router.post('/send', async (req, res) => {
  try {
    const { to, message, contactId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    // If contactId provided, look up phone from Contact
    let phoneNumber = to;
    if (contactId && !phoneNumber) {
      const contact = await prisma.contact.findFirst({
        where: { id: contactId, userId: req.user.id },
      });
      if (!contact) {
        return res.status(404).json({ success: false, error: 'Contact not found' });
      }
      phoneNumber = contact.mobile || contact.phone;
    }

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'No phone number provided or found for contact' });
    }

    const result = await sendTwilioSms(phoneNumber, message);

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.json({
      success: true,
      messageSid: result.messageSid,
      to: result.to,
    });
  } catch (err) {
    console.error('SMS send error:', err);
    res.status(500).json({ success: false, error: 'Failed to send SMS' });
  }
});

// POST /api/v1/sms/broadcast - Send SMS to multiple contacts
router.post('/broadcast', async (req, res) => {
  try {
    const { contactIds, message, campaignName } = req.body;

    if (!contactIds || contactIds.length === 0) {
      return res.status(400).json({ success: false, error: 'contactIds array is required' });
    }
    if (!message) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        userId: req.user.id,
        status: { not: 'unsubscribed' },
        smsOptIn: true,
      },
      include: { company: true },
    });

    const results = [];
    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      const phoneNumber = contact.mobile || contact.phone;
      if (!phoneNumber) {
        console.log(`SMS broadcast: skipping contact ${contact.id} — no phone number`);
        results.push({ contactId: contact.id, success: false, error: 'No phone number' });
        failed++;
        continue;
      }

      const personalizedMessage = replaceTemplateVars(message, contact, contact.company);
      const result = await sendTwilioSms(phoneNumber, personalizedMessage);

      if (result.success) {
        results.push({ contactId: contact.id, success: true, messageSid: result.messageSid });
        sent++;
      } else {
        results.push({ contactId: contact.id, success: false, error: result.error });
        failed++;
      }
    }

    res.json({
      success: true,
      campaignName: campaignName || null,
      sent,
      failed,
      total: contacts.length,
      results,
    });
  } catch (err) {
    console.error('SMS broadcast error:', err);
    res.status(500).json({ success: false, error: 'Failed to send broadcast' });
  }
});

// POST /api/v1/sms/sequence/create - Create drip SMS sequence
// NOTE: SmsSequence table does not exist yet — stores in-memory response only
router.post('/sequence/create', async (req, res) => {
  try {
    const { name, steps, contactIds } = req.body;

    if (!name || !steps || steps.length === 0) {
      return res.status(400).json({ success: false, error: 'name and steps are required' });
    }

    if (!contactIds || contactIds.length === 0) {
      return res.status(400).json({ success: false, error: 'contactIds array is required' });
    }

    // Validate contacts exist and belong to user
    const contactCount = await prisma.contact.count({
      where: { id: { in: contactIds }, userId: req.user.id },
    });

    // TODO: Persist to SmsSequence table when schema is added
    const sequenceId = `seq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    res.json({
      success: true,
      sequenceId,
      name,
      steps: steps.map((s, i) => ({
        step: i + 1,
        message: s.message,
        delayDays: s.delayDays || 0,
      })),
      contactCount,
      status: 'created',
      note: 'Sequence created. Automated scheduling requires SmsSequence table migration.',
    });
  } catch (err) {
    console.error('SMS sequence create error:', err);
    res.status(500).json({ success: false, error: 'Failed to create sequence' });
  }
});

// GET /api/v1/sms/inbox - Get received SMS messages
// NOTE: SmsMessage table does not exist yet — returns empty until schema migration
router.get('/inbox', async (req, res) => {
  try {
    // TODO: Query SmsMessage table where direction='inbound' when schema is added
    res.json({
      success: true,
      messages: [],
      note: 'Inbound SMS storage requires SmsMessage table migration.',
    });
  } catch (err) {
    console.error('SMS inbox error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch inbox' });
  }
});

// --- Public webhook (NO auth) ---

// POST /api/v1/sms/webhook - Twilio inbound SMS webhook
router.post('/webhook', async (req, res) => {
  try {
    const from = req.body.From;
    const body = req.body.Body || '';
    const messageSid = req.body.MessageSid;

    console.log(`SMS webhook received: from=${from}, body="${body}", sid=${messageSid}`);

    // TCPA compliance: honor STOP requests
    if (body.trim().toUpperCase() === 'STOP') {
      // Unsubscribe: find contacts with this phone and set smsOptIn=false
      await prisma.contact.updateMany({
        where: {
          OR: [{ phone: from }, { mobile: from }],
        },
        data: { smsOptIn: false, status: 'unsubscribed' },
      });

      console.log(`SMS STOP received from ${from} — unsubscribed`);

      // Reply with unsubscribe confirmation
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

      if (accountSid && authToken && messagingServiceSid) {
        await sendTwilioSms(from, 'You have been unsubscribed. Reply START to resubscribe.');
      }
    }

    // Handle START (re-subscribe)
    if (body.trim().toUpperCase() === 'START') {
      await prisma.contact.updateMany({
        where: {
          OR: [{ phone: from }, { mobile: from }],
        },
        data: { smsOptIn: true, status: 'active' },
      });

      console.log(`SMS START received from ${from} — resubscribed`);
    }

    // TODO: Save inbound message to SmsMessage table when schema is added

    // Return TwiML empty response
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  } catch (err) {
    console.error('SMS webhook error:', err);
    res.set('Content-Type', 'text/xml');
    res.send('<Response></Response>');
  }
});

module.exports = router;
