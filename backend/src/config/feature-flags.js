// Feature Flags - Toggle features via environment variables
// Core platforms default ON (set to 'false' to disable)
// New/experimental features default OFF (set to 'true' to enable)

module.exports = {
  // Core platforms (always enabled unless explicitly disabled)
  ENABLE_LEADSITE_AI: process.env.ENABLE_LEADSITE_AI !== 'false',
  ENABLE_LEADSITE_IO: process.env.ENABLE_LEADSITE_IO !== 'false',
  ENABLE_VIDEOSITE_AI: process.env.ENABLE_VIDEOSITE_AI !== 'false',
  ENABLE_CLIENT_CONTACT: process.env.ENABLE_CLIENT_CONTACT !== 'false',
  ENABLE_ULTRALEAD: process.env.ENABLE_ULTRALEAD !== 'false',

  // New features (disabled by default — set to 'true' in Railway to enable)
  ENABLE_NEXUS: process.env.ENABLE_NEXUS === 'true',
  ENABLE_AI_WEBSITE_EXTRACTION: process.env.ENABLE_AI_WEBSITE_EXTRACTION === 'true',
  ENABLE_PLATFORM_VERIFICATION: process.env.ENABLE_PLATFORM_VERIFICATION === 'true' || true,
};
