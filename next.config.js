/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode
  reactStrictMode: true,

  // Disable static page optimization for dynamic routes
  output: 'standalone',

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-2987.up.railway.app',
  },

  // API rewrites to Railway backend
  async rewrites() {
    const backendUrl = process.env.RAILWAY_API_URL || 'https://backend-production-2987.up.railway.app';

    return [
      // Proxy all /api/v1/* requests to Railway backend
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      // Health check
      {
        source: '/api/health',
        destination: `${backendUrl}/health`,
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.aileadstrategies.com',
          },
        ],
        destination: 'https://aileadstrategies.com/:path*',
        permanent: true,
      },
    ];
  },

  // Headers for CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },

  // Image domains
  images: {
    domains: ['aileadstrategies.com', 'leadstrategies-backend-production.up.railway.app'],
  },
};

module.exports = nextConfig;
