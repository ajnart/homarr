import baseConfig from "@homarr/eslint-config/base";
import nextjsConfig from "@homarr/eslint-config/nextjs";
import reactConfig from "@homarr/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
];
