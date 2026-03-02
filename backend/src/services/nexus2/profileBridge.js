// ═══════════════════════════════════════════════════════════════
// NEXUS 2.0 — PROFILE-TO-PIPELINE BRIDGE
// Converts a BusinessProfile record into the businessInputs format
// that the existing pipeline.js executePipeline() expects.
// Does NOT modify the pipeline — adapts the profile TO its interface.
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a BusinessProfile into the businessInputs object
 * expected by marketStrategy/pipeline.js executePipeline().
 *
 * @param {object} profile - Prisma BusinessProfile record
 * @returns {object} businessInputs compatible with executePipeline()
 */
function profileToMissionInputs(profile) {
  return {
    // --- Standard pipeline fields (required by executePipeline) ---
    targetMarket: profile.targetMarket,
    icp: profile.icp,
    competitors: profile.competitors,       // JSON array from Prisma
    offer: profile.offer,
    budgetRange: profile.budgetRange,
    platforms: profile.platforms,            // JSON array from Prisma
    notes: profile.uniqueValue || '',

    // --- Enriched context from Discovery Agent ---
    // Pipeline agents receive this via ctx.businessInputs.enrichedContext
    // Agents that don't need it simply ignore it (backwards compatible).
    enrichedContext: {
      businessName: profile.businessName,
      website: profile.website || null,
      industry: profile.industry,
      businessType: profile.businessType,
      ownSiteData: profile.discoveredData?.ownSite || null,
      socialProfiles: profile.socialProfiles || {},
      competitorIntel: profile.competitorIntel || null,
      marketIntel: profile.marketIntel || null,
      contentThemes: profile.contentThemes || null,
      audienceInsight: profile.audienceInsight || null,
      toneOfVoice: profile.toneOfVoice || 'professional',
      activeChannels: profile.activeChannels || [],
    },
  };
}

module.exports = { profileToMissionInputs };
