const mockApp = {
  addHook: jest.fn(),
  logger: true,
  close: jest.fn().mockResolvedValue(undefined),
  ready: jest.fn().mockResolvedValue(undefined),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

const mockProxy = jest.fn();
const mockRegisterRoutes = jest.fn();

jest.mock('fastify', () => {
  return jest.fn(() => mockApp);
});
jest.mock('@fastify/aws-lambda', () => {
  return jest.fn(() => mockProxy);
});
jest.mock('../src/auth/controllers/AuthController', () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    registerRoutes: mockRegisterRoutes
  }))
}));
jest.mock('../src/users/controllers/UserController', () => ({
  UserController: jest.fn().mockImplementation(() => ({
    registerRoutes: mockRegisterRoutes
  }))
}));
jest.mock('../src/notes/controllers/NoteController', () => ({
  NoteController: jest.fn().mockImplementation(() => ({
    registerRoutes: mockRegisterRoutes
  }))
}));

import { handler } from '../src/apiHandler';

describe('apiHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mockApp.close();
  });

  it('should call proxy with event and context', async () => {
    const mockEvent = { httpMethod: 'GET', path: '/test' };
    const mockContext = { requestId: '123' };
    const mockResponse = { statusCode: 200, body: 'OK' };

    mockProxy.mockResolvedValue(mockResponse);

    const result = await handler(mockEvent, mockContext);

    expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(result).toEqual(mockResponse);
  });

  it('should handle POST requests', async () => {
    const mockEvent = { 
      httpMethod: 'POST', 
      path: '/api/auth/login',
      body: JSON.stringify({ email: 'test@test.com', password: 'pass' })
    };
    const mockContext = { requestId: '456' };
    const mockResponse = { statusCode: 200, body: JSON.stringify({ token: 'abc' }) };

    mockProxy.mockResolvedValue(mockResponse);

    const result = await handler(mockEvent, mockContext);

    expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors from proxy', async () => {
    const mockEvent = { httpMethod: 'GET', path: '/error' };
    const mockContext = { requestId: '789' };
    const mockError = new Error('Proxy error');

    mockProxy.mockRejectedValue(mockError);

    await expect(handler(mockEvent, mockContext)).rejects.toThrow('Proxy error');
  });

  it('should handle PUT requests', async () => {
    const mockEvent = {
      httpMethod: 'PUT',
      path: '/api/users/123',
      body: JSON.stringify({ name: 'Updated' })
    };
    const mockContext = { requestId: 'abc-123' };
    const mockResponse = { statusCode: 200, body: 'Updated' };

    mockProxy.mockResolvedValue(mockResponse);

    const result = await handler(mockEvent, mockContext);

    expect(result).toEqual(mockResponse);
  });

  it('should handle DELETE requests', async () => {
    const mockEvent = { httpMethod: 'DELETE', path: '/api/users/123' };
    const mockContext = { requestId: 'delete-123' };
    const mockResponse = { statusCode: 204 };

    mockProxy.mockResolvedValue(mockResponse);

    const result = await handler(mockEvent, mockContext);

    expect(result).toEqual(mockResponse);
  });
});
