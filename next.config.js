/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: [
      'localhost',
      'eoahwxdhvdfgllolzoxd.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'PASADA CRM',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net cdnjs.cloudflare.com d3e54v103j8qbb.cloudfront.net cdn.prod.website-files.com www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' cdn.prod.website-files.com fonts.googleapis.com",
              "img-src 'self' data: blob: https: cdn.prod.website-files.com d3e54v103j8qbb.cloudfront.net",
              "font-src 'self' data: fonts.gstatic.com cdn.prod.website-files.com d3e54v103j8qbb.cloudfront.net",
              "media-src 'self' data: blob: cdn.prod.website-files.com",
              "connect-src 'self' https://*.supabase.co www.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/client',
        destination: '/client/dashboard',
        permanent: true,
      },
      {
        source: '/en',
        destination: '/pasada.design/en/homepage.html',
        permanent: false,
      },
      {
        source: '/en/homepage',
        destination: '/pasada.design/en/homepage.html',
        permanent: false,
      },
      {
        source: '/en/about',
        destination: '/pasada.design/en/about.html',
        permanent: false,
      },
      {
        source: '/en/projects',
        destination: '/pasada.design/en/projects.html',
        permanent: false,
      },
      {
        source: '/en/contant-us',
        destination: '/pasada.design/en/contant-us.html',
        permanent: false,
      },
      {
        source: '/works/:slug',
        destination: '/pasada.design/works/:slug.html',
        permanent: false,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add any custom webpack config here
    return config;
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Output configuration for static export (if needed)
  // output: 'export',

  // Output standalone for Docker deployment
  output: 'standalone',

  // Trailing slash
  trailingSlash: false,
};

module.exports = nextConfig;
