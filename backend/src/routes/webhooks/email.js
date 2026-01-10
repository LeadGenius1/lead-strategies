// Email Webhook Handler
// Handles inbound emails from SendGrid, AWS SES, etc.

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// SendGrid webhook (POST /webhooks/email/sendgrid)
router.post('/sendgrid', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // SendGrid sends webhook events as JSON array
    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    for (const event of events) {
      if (event.event === 'inbound') {
        // This is an inbound email event
        await processInboundEmail({
          from: event.from,
          to: event.to,
          subject: event.subject,
          text: event.text,
          html: event.html,
          messageId: event['message-id'],
          inReplyTo: event['In-Reply-To'],
          references: event.References,
          timestamp: new Date(event.timestamp * 1000),
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// AWS SES webhook (POST /webhooks/email/ses)
router.post('/ses', express.json(), async (req, res) => {
  try {
    // AWS SES sends notifications via SNS
    // For inbound emails, you typically use SES Receipt Rules with S3/Lambda
    // This is a simplified handler - adjust based on your SES setup
    
    const { Type, Message } = req.body;
    
    if (Type === 'Notification' && Message) {
      const message = JSON.parse(Message);
      
      if (message.notificationType === 'Received') {
        await processInboundEmail({
          from: message.mail.commonHeaders.from?.[0],
          to: message.mail.commonHeaders.to?.[0],
          subject: message.mail.commonHeaders.subject,
          text: message.content, // May need to fetch from S3
          html: null,
          messageId: message.mail.messageId,
          inReplyTo: message.mail.commonHeaders['in-reply-to']?.[0],
          references: message.mail.commonHeaders.references?.[0],
          timestamp: new Date(message.mail.timestamp),
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('AWS SES webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Generic inbound email processor
async function processInboundEmail({
  from,
  to,
  subject,
  text,
  html,
  messageId,
  inReplyTo,
  references,
  timestamp,
}) {
  try {
    // Extract email address from "Name <email@domain.com>" format
    const extractEmail = (str) => {
      const match = str?.match(/<(.+)>/);
      return match ? match[1] : str;
    };

    const fromEmail = extractEmail(from);
    const toEmail = extractEmail(to);

    // Find or create conversation
    // Check if this is a reply to an existing conversation
    let conversation = null;
    
    if (inReplyTo || references) {
      // Try to find conversation by message ID
      const existingMessage = await prisma.message.findFirst({
        where: {
          externalMessageId: inReplyTo || references,
        },
        include: {
          conversation: true,
        },
      });

      if (existingMessage) {
        conversation = existingMessage.conversation;
      }
    }

    // If no conversation found, create new one
    if (!conversation) {
      // Try to find existing conversation by email
      conversation = await prisma.conversation.findFirst({
        where: {
          contactEmail: fromEmail,
          channel: 'email',
        },
        orderBy: { createdAt: 'desc' },
      });

      // Create new conversation if none exists
      if (!conversation) {
        // For now, assign to first user (in production, use routing logic)
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) {
          throw new Error('No users found in database');
        }

        conversation = await prisma.conversation.create({
          data: {
            userId: firstUser.id,
            contactEmail: fromEmail,
            contactName: from?.replace(/<.+>/, '').trim() || fromEmail,
            channel: 'email',
            subject: subject || 'No Subject',
            status: 'open',
            priority: 'normal',
            unreadCount: 1,
            messageCount: 0,
          },
        });
      }
    }

    // Create inbound message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: conversation.userId,
        content: text || html?.replace(/<[^>]*>/g, '') || '',
        htmlContent: html,
        subject,
        channel: 'email',
        direction: 'inbound',
        status: 'received',
        externalMessageId: messageId,
        receivedAt: timestamp || new Date(),
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    console.log(`Inbound email processed: ${messageId} -> Conversation ${conversation.id}`);
  } catch (error) {
    console.error('Process inbound email error:', error);
    throw error;
  }
}

module.exports = router;
