// NEXUS Platform Functions #14-#25
// Lightweight wrappers that call existing platform backend routes via Prisma
// Each function returns live data from the database or a graceful stub
const { prisma } = require('../../config/database');

// ==================== LeadSite.IO (#14-#16) ====================

/**
 * #14 get_websites — List user's websites
 */
async function getWebsites(params) {
  try {
    const userId = params.userId;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const websites = await prisma.website.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, slug: true, template: true,
        status: true, isPublished: true, createdAt: true, updatedAt: true
      }
    });

    return { success: true, websites, total: websites.length };
  } catch (error) {
    return { success: false, error: `get_websites error: ${error.message}` };
  }
}

/**
 * #15 create_website — Create a new website
 */
async function createWebsite(params) {
  try {
    const { name, template, userId } = params;
    if (!name || !userId) {
      return { success: false, error: 'name and userId are required' };
    }

    const website = await prisma.website.create({
      data: {
        userId,
        name,
        template: template || 'aether',
        status: 'draft',
        content: {}
      }
    });

    return { success: true, websiteId: website.id, name: website.name };
  } catch (error) {
    return { success: false, error: `create_website error: ${error.message}` };
  }
}

/**
 * #16 update_website — Update website properties
 */
async function updateWebsite(params) {
  try {
    const { websiteId, changes } = params;
    if (!websiteId) {
      return { success: false, error: 'websiteId is required' };
    }

    const allowedFields = ['name', 'template', 'status', 'slug', 'htmlContent', 'content'];
    const updateData = {};
    for (const key of allowedFields) {
      if (changes && changes[key] !== undefined) {
        updateData[key] = changes[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No valid changes provided' };
    }

    const website = await prisma.website.update({
      where: { id: websiteId },
      data: updateData
    });

    return { success: true, websiteId: website.id, updated: Object.keys(updateData) };
  } catch (error) {
    return { success: false, error: `update_website error: ${error.message}` };
  }
}

// ==================== ClientContact.IO (#17-#19) ====================

/**
 * #17 get_inbox_messages — Get conversations from unified inbox
 */
async function getInboxMessages(params) {
  try {
    const { userId, limit } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
      take: limit || 20,
      select: {
        id: true, contactName: true, contactEmail: true,
        channel: true, status: true, subject: true,
        messageCount: true, unreadCount: true,
        lastMessageAt: true, createdAt: true
      }
    });

    return { success: true, conversations, total: conversations.length };
  } catch (error) {
    return { success: false, error: `get_inbox_messages error: ${error.message}` };
  }
}

/**
 * #18 send_sms — Send SMS via sms-controller
 */
async function sendSmsWrapper(params) {
  try {
    const { sendSMS } = require('./sms-controller');
    return await sendSMS(params.to, params.message);
  } catch (error) {
    return { success: false, error: `send_sms error: ${error.message}` };
  }
}

/**
 * #19 get_contacts — Get CRM contacts
 */
async function getContacts(params) {
  try {
    const { userId, filter } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const where = { userId };
    if (filter) {
      if (filter.status) where.status = filter.status;
      if (filter.lifecycle) where.lifecycle = filter.lifecycle;
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, firstName: true, lastName: true, email: true,
        phone: true, jobTitle: true, status: true, lifecycle: true,
        company: { select: { id: true, name: true } }
      }
    });

    return { success: true, contacts, total: contacts.length };
  } catch (error) {
    return { success: false, error: `get_contacts error: ${error.message}` };
  }
}

// ==================== VideoSite.AI (#20-#22) ====================

/**
 * #20 get_videos — Get user's videos
 */
async function getVideos(params) {
  try {
    const { userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, description: true, status: true,
        viewCount: true, earnings: true, duration: true,
        fileUrl: true, thumbnailUrl: true, createdAt: true
      }
    });

    return { success: true, videos, total: videos.length };
  } catch (error) {
    return { success: false, error: `get_videos error: ${error.message}` };
  }
}

/**
 * #21 get_video_analytics — Get analytics for a specific video
 */
async function getVideoAnalytics(params) {
  try {
    const { videoId } = params;
    if (!videoId) {
      return { success: false, error: 'videoId is required' };
    }

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true, title: true, viewCount: true, earnings: true,
        isMonetized: true, status: true, duration: true, createdAt: true
      }
    });

    if (!video) {
      return { success: false, error: 'Video not found' };
    }

    return { success: true, analytics: video };
  } catch (error) {
    return { success: false, error: `get_video_analytics error: ${error.message}` };
  }
}

/**
 * #22 upload_video_url — Create a video entry from URL
 */
async function uploadVideoUrl(params) {
  try {
    const { title, url, userId } = params;
    if (!title || !url || !userId) {
      return { success: false, error: 'title, url, and userId are required' };
    }

    const video = await prisma.video.create({
      data: {
        userId,
        title,
        fileUrl: url,
        status: 'processing'
      }
    });

    return { success: true, videoId: video.id, title: video.title, status: 'processing' };
  } catch (error) {
    return { success: false, error: `upload_video_url error: ${error.message}` };
  }
}

// ==================== UltraLead.AI (#23-#25) ====================

/**
 * #23 get_pipeline — Get sales pipeline deals
 */
async function getPipeline(params) {
  try {
    const { userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const deals = await prisma.deal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, value: true, currency: true,
        stage: true, probability: true, priority: true,
        expectedClose: true, createdAt: true,
        company: { select: { id: true, name: true } }
      }
    });

    // Group by stage for pipeline view
    const stages = {};
    for (const deal of deals) {
      if (!stages[deal.stage]) stages[deal.stage] = [];
      stages[deal.stage].push(deal);
    }

    return { success: true, deals, stages, total: deals.length };
  } catch (error) {
    return { success: false, error: `get_pipeline error: ${error.message}` };
  }
}

/**
 * #24 create_deal — Create a new deal in pipeline
 */
async function createDeal(params) {
  try {
    const { name, value, stage, contactId, userId } = params;
    if (!name || !userId) {
      return { success: false, error: 'name and userId are required' };
    }

    const deal = await prisma.deal.create({
      data: {
        userId,
        name,
        value: value || 0,
        stage: stage || 'lead',
        contacts: contactId ? { connect: [{ id: contactId }] } : undefined
      }
    });

    return { success: true, dealId: deal.id, name: deal.name, stage: deal.stage };
  } catch (error) {
    return { success: false, error: `create_deal error: ${error.message}` };
  }
}

/**
 * #25 get_transcriptions — Get call transcriptions
 */
async function getTranscriptions(params) {
  try {
    const { userId, limit } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }

    const calls = await prisma.call.findMany({
      where: {
        userId,
        transcription: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: limit || 10,
      select: {
        id: true, direction: true, fromNumber: true, toNumber: true,
        duration: true, transcription: true, summary: true,
        sentiment: true, actionItems: true, createdAt: true,
        contact: { select: { firstName: true, lastName: true, email: true } }
      }
    });

    return { success: true, transcriptions: calls, total: calls.length };
  } catch (error) {
    return { success: false, error: `get_transcriptions error: ${error.message}` };
  }
}

module.exports = {
  getWebsites,
  createWebsite,
  updateWebsite,
  getInboxMessages,
  sendSmsWrapper,
  getContacts,
  getVideos,
  getVideoAnalytics,
  uploadVideoUrl,
  getPipeline,
  createDeal,
  getTranscriptions
};
