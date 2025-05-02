/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  // Disable TypeScript type checking during build
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors compromises type safety
    // Only use this for temporary workarounds
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors is not recommended
    // Only use this for temporary workarounds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 