import type { NextConfig } from "next";

// Content Security Policy. Tightened for our actual integrations:
//   - YouTube IFrame API for the video player
//   - Supabase REST/Auth/Realtime for data
//   - Google profile pictures + YouTube thumbnails for next/image
// `unsafe-inline` for script-src is unfortunately required by Next.js until
// the inline runtime/JSON payloads it injects are nonce-d. Revisit when
// Next.js ships first-class nonce support.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://i.ytimg.com https://lh3.googleusercontent.com https://*.supabase.co https://*.supabase.in",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};

export default nextConfig;
