/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "carpoolnubucket.s3.us-east-2.amazonaws.com",
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;