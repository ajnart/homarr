/// <reference types="./types.d.ts" />

import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Globally ignored files
    ignores: ["**/*.config.js", "**/*.cjs", "**/lang/*.d.json.ts"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [2, { checksVoidReturn: { attributes: false } }],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "id-length": [
        "warn",
        {
          min: 3,
          exceptions: ["_", "i", "z", "t", "id", "db", "fs"], // _ for unused variables, i for index, z for zod, t for translation
          properties: "never", // This allows for example the use of <Grid.Col span={{ sm: 12, md: 6 }}> as sm and md would be too short
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[async=false][id.name=/Async$/]",
          message: "Function ending in 'Async' must be declared async",
        },
        {
          selector:
            "FunctionDeclaration[async=true][id.name=/^[a-z].*$/][id.name=/ ^(?!generateMetadata$)[a-z].*$/][id.name!=/Async$/]",
          message: "Async function name must end in 'Async' (function declaration)",
        },
        {
          selector: "MethodDefinition[value.async=false][key.name=/Async$/]",
          message: "Method ending in 'Async' must be declared async",
        },
        {
          selector: "MethodDefinition[value.async=true][key.name!=/Async$/]",
          message: "Async method name must end in 'Async'",
        },
        {
          selector: "Property[value.type=/FunctionExpression$/][value.async=false][key.name=/Async$/]",
          message: "Function ending in 'Async' must be declared async",
        },
        {
          selector:
            "Property[value.type=/FunctionExpression$/][value.async=true][key.name!=/^on(Success|Settled)$/][key.name!=/Async$/]",
          message: "Async function name must end in 'Async' (property)",
        },
        {
          selector: "VariableDeclarator[init.type=/FunctionExpression$/][init.async=false][id.name=/Async$/]",
          message: "Function ending in 'Async' must be declared async",
        },
        {
          selector:
            "VariableDeclarator[init.type=/FunctionExpression$/][init.async=true][id.name=/^[a-z].*$/][id.name!=/Async$/]",
          message: "Async function name must end in 'Async' (variable declarator)",
        },
        {
          // \\u002F is the unicode escape for / and is used because of https://github.com/estools/esquery/issues/68
          selector: "Literal[value=/^https:\\u002F\\u002Fhomarr\\.dev\\u002F.*$/]",
          message: "Links to 'https://homarr.dev/' should be used with createDocumentationLink method",
        },
      ],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { project: true } },
  },
);
