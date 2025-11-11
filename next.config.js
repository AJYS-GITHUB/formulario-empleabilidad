/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  async headers() {
    return [
      {
        // Aplicar headers a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Permite embebido en el mismo dominio, cambia a 'ALLOWALL' si necesitas embebido desde cualquier dominio
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *", // Permite embebido desde cualquier dominio
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;