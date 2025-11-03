/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false, // ✅ restore normal Next.js image behavior
  },
};

module.exports = nextConfig;
