
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
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",

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
