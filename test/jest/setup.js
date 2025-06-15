// Increase timeout for async operations
jest.setTimeout(5000);

// Mock console.log to keep test output clean
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}; 