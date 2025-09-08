import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
  async headers() {
    return [
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable", // 1 week
          },
        ],
      },
      { //favicons
        source: "/(favicon_32x32.png|favicon_48x48.png|favicon_96x96.png|favicon_144x144.png|favicon.ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, immutable", // 1 week
          },
        ],
      }
    ];
  }
}
 
export default nextConfig;
