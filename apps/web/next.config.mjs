/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true }, // linting is a gate, not a build step
};
