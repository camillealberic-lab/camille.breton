/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode surfaces unsafe lifecycles and side-effects in dev
  reactStrictMode: true,

  // Stop advertising the framework in response headers
  poweredByHeader: false,

  // Enable gzip compression for all responses
  compress: true,

  /* ── Image optimization ────────────────────────────────────────────
     - AVIF first, WebP fallback — AVIF is ~30 % smaller at equal quality
     - deviceSizes aligned with our `sizes` breakpoints (`768px` = md)
     - minimumCacheTTL at 30 days so returning visitors don't refetch */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /* ── Tree-shake heavy libraries ───────────────────────────────────
     Next will rewrite `import { motion } from 'framer-motion'` to only
     pull in the modules actually used by each route. */
  experimental: {
    optimizePackageImports: ['framer-motion', 'lenis'],
  },
};

export default nextConfig;
