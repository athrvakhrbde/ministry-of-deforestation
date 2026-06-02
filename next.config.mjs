/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  transpilePackages: ["maplibre-gl"],
  experimental: {
    optimizePackageImports: ["recharts", "date-fns", "@supabase/supabase-js"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config, { isServer }) => {
    // Map libraries are client-only; avoid broken server chunks referencing map bundles
    if (isServer) {
      config.externals = [...(config.externals || []), "mapbox-gl", "maplibre-gl"];
    }
    return config;
  },
};

export default nextConfig;
