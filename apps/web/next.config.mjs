import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
export default withNextIntl({
  reactStrictMode: true,
  /* `next build` and `next dev` share .next by default, so running the gate
     suite while a dev server is up leaves that server serving a half-written
     build and returning 500s. Giving the production build its own directory
     keeps the two independent. VOID_DIST_DIR is set by the gate scripts. */
  distDir: process.env.VOID_DIST_DIR || ".next",
  eslint: { ignoreDuringBuilds: true }, // linting is a gate, not a build step
});
