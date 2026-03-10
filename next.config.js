/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required to receive raw body in Stripe webhook route
  experimental: {},
}

module.exports = nextConfig
