/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@masari/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
