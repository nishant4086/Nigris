export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  watchman: false,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coverageProvider: "v8",
};
