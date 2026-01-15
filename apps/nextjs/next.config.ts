// Importing env files here to validate on build
import "@homarr/auth/env";
import "@homarr/core/infrastructure/db/env";
import "@homarr/common/env";
import "@homarr/core/infrastructure/logs/env";
import "@homarr/docker/env";

import type { NextConfig } from "next";
import MillionLint from "@million/lint";
import createNextIntlPlugin from "next-intl/plugin";

// Package path does not work... so we need to use relative path
const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "../../packages/translation/src/lang/en.json",
  },
  requestConfig: "../../packages/translation/src/request.ts",
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // react compiler breaks mantine-react-table, so disabled for now
  //reactCompiler: true,
  /** We already do typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
  /**
   * dockerode is required in the external server packages because of https://github.com/homarr-labs/homarr/issues/612
   * isomorphic-dompurify and jsdom are required, see https://github.com/kkomelin/isomorphic-dompurify/issues/356
   */
  serverExternalPackages: ["dockerode", "isomorphic-dompurify", "jsdom"],
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@tabler/icons-react"],
    turbopackFileSystemCacheForDev: true,
  },
  transpilePackages: ["@homarr/ui", "@homarr/notifications", "@homarr/modals", "@homarr/spotlight", "@homarr/widgets"],
  images: {
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/require-await,no-restricted-syntax
  async headers() {
    return [
      {
        source: "/(.*)", // Apply CSP to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            // worker-src / media-src with blob: is necessary for video.js, see https://github.com/homarr-labs/homarr/issues/3912 and https://stackoverflow.com/questions/65792855/problem-with-video-js-and-content-security-policy-csp
            value: `
              default-src 'self';
              script-src * 'unsafe-inline' 'unsafe-eval';
              worker-src * blob:;
              base-uri 'self';
              connect-src *;
              style-src * 'unsafe-inline'; 
              frame-ancestors *;
              frame-src *;
              form-action 'self';
              img-src * data:;
              font-src * data:;
              media-src * data: blob:;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

// Skip transform is used because of webpack loader, without it for example 'Tooltip.Floating' will not work and show an error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const withMillionLint = MillionLint.next({ rsc: true, skipTransform: true, telemetry: false });

export default withNextIntl(nextConfig);
