import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
export default withNextIntl({
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true }, // linting is a gate, not a build step
});
