/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC to avoid binary issues
  compiler: {
    // Use Babel instead of SWC
  },
}

module.exports = nextConfig

