// eslint.config.js
// CommonJS syntax for ESLint v9 configuration

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Base ESLint configuration
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", "**/*.js"],
  },
  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      // General rules
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],

      // Prettier integration
      "prettier/prettier": "error",
    },
  },
]
