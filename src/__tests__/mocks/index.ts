import { jest } from "@jest/globals";

// Mock logger
export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

// Reset all mocks
export const resetAllMocks = (): void => {
  mockLogger.info.mockReset();
  mockLogger.error.mockReset();
};
