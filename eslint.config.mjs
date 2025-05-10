import pluginSolid from "eslint-plugin-solid";
import pluginTypescript from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";

/** @type {import("@typescript-eslint/utils/ts-eslint").FlatConfig.Config[]} */
export default [
  {
    ignores: ["dist/", "node_modules/"],
  },
  ...pluginTypescript.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...pluginSolid.configs["flat/typescript"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
  },
  {
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-console": "warn",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-wrapper-object-types": "error",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",

      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
        },
      ],

      "solid/reactivity": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "error",
    },
  },
];
