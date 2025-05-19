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

// Mock database client
export const mockDbClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  isConnected: jest.fn().mockReturnValue(true),
  getStatus: jest.fn().mockReturnValue({
    isConnected: true,
    lastConnected: new Date(),
    connectionAttempts: 1,
  }),
  executeQuery: jest.fn().mockResolvedValue([]),
  getPrismaClient: jest.fn().mockReturnValue({
    subscription: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  }),
};

// Mock Prisma client
export const mockPrismaClient = {
  subscription: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $on: jest.fn(),
  $queryRawUnsafe: jest.fn(),
};
