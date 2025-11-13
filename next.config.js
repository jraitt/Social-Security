/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker
  output: 'standalone',
  // Enable Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize for production
  swcMinify: true,
  // Environment variables to expose to the client
  env: {
    ENABLE_ENHANCED_OPTIMIZATION: process.env.ENABLE_ENHANCED_OPTIMIZATION || 'true',
    ENABLE_PRESENT_VALUE: process.env.ENABLE_PRESENT_VALUE || 'true',
    ENABLE_PROJECTIONS: process.env.ENABLE_PROJECTIONS || 'true',
  },
}

module.exports = nextConfig
