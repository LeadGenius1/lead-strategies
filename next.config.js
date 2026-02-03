/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com',
  },
  // Generate stable build ID to prevent Server Action errors
  generateBuildId: async () => {
    return process.env.RAILWAY_GIT_COMMIT_SHA || 'local-build'
  },
  // Configure server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Disable standalone - start.js (Next.js programmatic API) works reliably with standard build
  // output: 'standalone',
  // Legacy URL redirects
  async redirects() {
    return [
      { source: '/tackle-io', destination: '/ultralead', permanent: true },
      { source: '/tackle', destination: '/ultralead', permanent: true },
      { source: '/videosite-io', destination: '/videosite-ai', permanent: true },
    ];
  },
}

module.exports = nextConfig


