/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    // Paths to files that Jest should test
    testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/node_modules/**"],
    coverageReporters: ["text", "lcov"],
    // Configuration for E2E tests
    testTimeout: 30000
};
