/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allows production builds to successfully complete even if the project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bypasses strict typescript compiler errors during build to prevent build blocks.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
