/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimize for Railway deployment
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai',
  },
  // Ensure public and static files are copied in standalone mode
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig


