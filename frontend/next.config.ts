import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiServerUrl = (
      process.env.API_SERVER_URL || "http://127.0.0.1:4000/api"
    ).replace(/\/$/, "");

    return [
      {
        source: "/blog/:slug",
        destination: "/?page=blog&blog=:slug",
      },
      { source: "/blog", destination: "/?page=blog" },
      { source: "/shop", destination: "/?page=shop" },
      { source: "/wishlist", destination: "/?page=wishlist" },
      { source: "/info", destination: "/?page=info" },
      { source: "/checkout", destination: "/?page=checkout" },
      { source: "/account", destination: "/?page=account" },
      { source: "/order-confirmation", destination: "/?page=order-placed" },
      { source: "/product/:slug", destination: "/?page=product&product=:slug" },
      { source: "/pages/:slug", destination: "/?page=content&content=:slug" },
      {
        source: "/api/:path*",
        destination: `${apiServerUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
