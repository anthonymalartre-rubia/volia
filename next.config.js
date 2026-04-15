/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses (gzip/brotli)
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Security + caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(.*)\\.(js|css|woff2|woff|ttf|ico|png|jpg|jpeg|svg|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Reduce bundle: don't include server-only packages in client
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
