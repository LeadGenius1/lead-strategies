/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode
  reactStrictMode: true,
  
  // Domain configuration
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
    ];
  },
  
  // Redirect configuration for custom domain
  async redirects() {
    return [
      // Redirect www to non-www (if needed)
      // {
      //   source: '/:path*',
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'www.aileadstrategies.com',
      //     },
      //   ],
      //   destination: 'https://aileadstrategies.com/:path*',
      //   permanent: true,
      // },
    ];
  },
};

module.exports = nextConfig;
