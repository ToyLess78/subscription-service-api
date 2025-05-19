import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/config/**",
    "!src/plugins/**",
    "!src/db/migration-runner.ts",
    "!src/db/database.factory.ts",
    "!src/db/index.ts",
    "!src/schemas/**",
    "!src/routes/**",
    "!src/middlewares/**",
    "!src/repositories/**",
    "!src/__tests__/**",
  ],
  coverageReporters: ["text", "lcov"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
      },
    ],
  },
}

export default config
