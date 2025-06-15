module.exports = {
  transform: {},
  moduleNameMapper: {
    '^(\.{1,2}/.*)\.js$': '$1',
  },
  testEnvironment: 'node',
  // testTimeout: 30000,
  setupFilesAfterEnv: ['./test/jest/setup.js'],
  testMatch: ['**/test/jest/**/*.test.js'],
  testTimeout: 30000,
  verbose: true
};