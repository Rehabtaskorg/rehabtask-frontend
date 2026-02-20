/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xtailsgtkrmwezdiymmw.supabase.co",
        pathname: "/storage/v1/object/public/**"
      },
    ],
  },
};

export default nextConfig;
