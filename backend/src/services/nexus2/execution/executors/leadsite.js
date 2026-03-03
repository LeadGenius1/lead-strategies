// ═══════════════════════════════════════════════════════════════
// EXECUTOR — LEADSITE (Landing Pages)
// Creates a Website record via Prisma with draft status.
// ═══════════════════════════════════════════════════════════════

const { prisma } = require('../../../../config/database');

/**
 * Create a landing page for a campaign.
 *
 * @param {object} payload
 * @param {string} payload.userId - Owner user ID
 * @param {string} payload.title - Page title
 * @param {string} payload.content - Page content/body
 * @param {string} [payload.slug] - URL slug (auto-generated if omitted)
 * @param {string} [payload.template] - Template name
 * @returns {Promise<object>}
 */
async function createPage({ userId, title, content, slug, template }) {
  if (!userId || !title) {
    return { status: 'failed', error: 'userId and title are required' };
  }

  try {
    const pageSlug = slug || `page-${Date.now().toString(36)}`;

    const website = await prisma.website.create({
      data: {
        userId,
        name: title,
        slug: pageSlug,
        template: template || 'default',
        status: 'draft',
        content: typeof content === 'string' ? content : JSON.stringify(content || {}),
      },
    });

    return {
      status: 'completed',
      pageId: website.id,
      slug: website.slug,
      message: `Landing page "${title}" created as draft`,
    };
  } catch (err) {
    return { status: 'failed', error: `Page creation failed: ${err.message}` };
  }
}

module.exports = { createPage };
