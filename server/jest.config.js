export default {
  testEnvironment: "node",
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  watchman: false,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageProvider: "v8",
  // Ignore standalone integration scripts that are not Jest test suites
  testPathIgnorePatterns: ["/tests/entries.test.js"],
};
