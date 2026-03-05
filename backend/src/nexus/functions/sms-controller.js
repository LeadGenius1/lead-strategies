// NEXUS Function #13: SMS Controller — Twilio SMS Campaign Management
const { prisma } = require('../../config/database');

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

/**
 * Send a single SMS via Twilio REST API
 */
async function sendSMS(to, message) {
  try {
    if (!to || !message) {
      return { success: false, error: 'to and message are required' };
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return { success: false, error: 'Twilio credentials not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)' };
    }

    if (!TWILIO_PHONE_NUMBER && !TWILIO_MESSAGING_SERVICE_SID) {
      return { success: false, error: 'TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID is required' };
    }

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const body = new URLSearchParams({ To: to, Body: message });

    if (TWILIO_MESSAGING_SERVICE_SID) {
      body.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
    } else {
      body.append('From', TWILIO_PHONE_NUMBER);
    }

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || 'Twilio API error', code: data.code };
    }

    return { success: true, messageSid: data.sid, to: data.to, status: data.status };
  } catch (error) {
    return { success: false, error: `Send SMS error: ${error.message}` };
  }
}

/**
 * Send bulk SMS with 1-second delay between messages to avoid rate limits
 */
async function sendBulkSMS(recipients, message) {
  try {
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return { success: false, error: 'recipients array is required' };
    }
    if (!message) {
      return { success: false, error: 'message is required' };
    }

    const results = [];

    for (let i = 0; i < recipients.length; i++) {
      const result = await sendSMS(recipients[i], message);
      results.push({ to: recipients[i], ...result });

      // 1-second delay between messages to avoid Twilio rate limits
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      totalRecipients: recipients.length,
      sent: successCount,
      failed: recipients.length - successCount,
      results
    };
  } catch (error) {
    return { success: false, error: `Bulk SMS error: ${error.message}` };
  }
}

/**
 * Get SMS campaign status from database
 */
async function getSMSCampaignStatus(campaignId) {
  try {
    if (!campaignId) {
      return { success: false, error: 'campaignId is required' };
    }

    const campaign = await prisma.sMSCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return { success: false, error: 'SMS campaign not found' };
    }

    return {
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        message: campaign.message,
        recipientCount: Array.isArray(campaign.recipientsJson) ? campaign.recipientsJson.length : 0,
        status: campaign.status,
        sentAt: campaign.sentAt,
        createdAt: campaign.createdAt
      }
    };
  } catch (error) {
    return { success: false, error: `Campaign status error: ${error.message}` };
  }
}

/**
 * Create an SMS campaign — saves to DB and queues for sending
 */
async function createSMSCampaign(name, message, recipients) {
  try {
    if (!name || !message || !recipients || recipients.length === 0) {
      return { success: false, error: 'name, message, and recipients are required' };
    }

    const campaign = await prisma.sMSCampaign.create({
      data: {
        name,
        message,
        recipientsJson: recipients,
        status: 'queued'
      }
    });

    return {
      success: true,
      campaignId: campaign.id,
      name: campaign.name,
      recipientCount: recipients.length,
      status: 'queued',
      message: `SMS campaign "${name}" created with ${recipients.length} recipients. Use action "send_campaign" to send.`
    };
  } catch (error) {
    return { success: false, error: `Create campaign error: ${error.message}` };
  }
}

/**
 * Send a queued SMS campaign
 */
async function sendSMSCampaign(campaignId) {
  try {
    const campaign = await prisma.sMSCampaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return { success: false, error: 'SMS campaign not found' };
    }

    if (campaign.status === 'sent') {
      return { success: false, error: 'Campaign already sent' };
    }

    const recipients = campaign.recipientsJson;
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return { success: false, error: 'Campaign has no recipients' };
    }

    // Update status to sending
    await prisma.sMSCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending' }
    });

    // Send in bulk
    const result = await sendBulkSMS(recipients, campaign.message);

    // Update status
    await prisma.sMSCampaign.update({
      where: { id: campaignId },
      data: {
        status: result.success ? 'sent' : 'failed',
        sentAt: result.success ? new Date() : null
      }
    });

    return {
      success: result.success,
      campaignId,
      sent: result.sent,
      failed: result.failed
    };
  } catch (error) {
    return { success: false, error: `Send campaign error: ${error.message}` };
  }
}

/**
 * NEXUS function handler — dispatches sms_control actions
 */
async function smsControl(params) {
  const { action, to, recipients, message, campaignId, name } = params || {};

  switch (action) {
    case 'send_single':
      return await sendSMS(to, message);
    case 'send_bulk':
      return await sendBulkSMS(recipients, message);
    case 'get_status':
      return await getSMSCampaignStatus(campaignId);
    case 'create_campaign':
      return await createSMSCampaign(name, message, recipients);
    case 'send_campaign':
      return await sendSMSCampaign(campaignId);
    default:
      return { error: `Unknown SMS action: ${action}` };
  }
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  getSMSCampaignStatus,
  createSMSCampaign,
  sendSMSCampaign,
  smsControl
};
