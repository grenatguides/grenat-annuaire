/** @type {import('next').NextConfig} */
// En-têtes de sécurité. Les pages /embed/* peuvent être intégrées dans le site Framer
// (lesguidesgrenat.fr et l'éditeur Framer) ; les autres pages ne peuvent pas être intégrées ailleurs.
const FRAMER = "https://lesguidesgrenat.fr https://*.lesguidesgrenat.fr https://framer.com https://*.framer.com https://*.framer.app https://*.framercanvas.com";
const communs = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  async headers() {
    return [
      { source: '/((?!embed/).*)', headers: [...communs, { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" }] },
      { source: '/embed/:path*', headers: [...communs, { key: 'Content-Security-Policy', value: `frame-ancestors 'self' ${FRAMER}` }] },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prod-files-secure.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
