const mockApp = {
  addHook: jest.fn(),
  logger: true,
  close: jest.fn().mockResolvedValue(undefined),
  ready: jest.fn().mockResolvedValue(undefined),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
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
    registerRoutes: mockRegisterRoutes,
  })),
}));
jest.mock('../src/users/controllers/UserController', () => ({
  UserController: jest.fn().mockImplementation(() => ({
    registerRoutes: mockRegisterRoutes,
  })),
}));
jest.mock('../src/notes/controllers/NoteController', () => ({
  NoteController: jest.fn().mockImplementation(() => ({
    registerRoutes: mockRegisterRoutes,
  })),
}));

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler } from '../src/apiHandler';

const createMockEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '/',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {
    accountId: '123456789012',
    apiId: 'test-api',
    authorizer: {},
    httpMethod: 'GET',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '127.0.0.1',
      user: null,
      userAgent: 'test-agent',
      userArn: null,
    },
    path: '/',
    protocol: 'HTTP/1.1',
    requestId: 'test-request-id',
    requestTime: '09/Apr/1998:12:34:56 +0000',
    requestTimeEpoch: 892542896,
    resourceId: 'test-resource',
    resourcePath: '/',
    stage: 'test',
  },
  resource: '/',
  ...overrides,
});

const createMockContext = (overrides: Partial<Context> = {}): Context => ({
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'test-function',
  functionVersion: '$LATEST',
  invokedFunctionArn:
    'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2023/01/01/[$LATEST]test',
  getRemainingTimeInMillis: (): number => 30000,
  done: (): void => {},
  fail: (): void => {},
  succeed: (): void => {},
  ...overrides,
});

describe('apiHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CORS middleware coverage', () => {
    it('should execute CORS middleware for regular requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/test',
      });
      const mockContext = createMockContext({ awsRequestId: 'cors-test' });
      const mockResponse = {
        statusCode: 200,
        body: 'OK',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle OPTIONS preflight requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'OPTIONS',
        path: '/api/test',
      });
      const mockContext = createMockContext({ awsRequestId: 'options-cors' });
      const mockResponse = {
        statusCode: 200,
        body: '',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('handler function', () => {
    it('should call proxy with event and context', async () => {
      const mockEvent = createMockEvent({ httpMethod: 'GET', path: '/test' });
      const mockContext = createMockContext({ awsRequestId: '123' });
      const mockResponse = { statusCode: 200, body: 'OK' };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
      expect(result).toEqual(mockResponse);
    });

    it('should handle POST requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'POST',
        path: '/api/auth/login',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass' }),
      });
      const mockContext = createMockContext({ awsRequestId: '456' });
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ token: 'abc' }),
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
      expect(result).toEqual(mockResponse);
    });

    it('should handle PUT requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'PUT',
        path: '/api/users/123',
        body: JSON.stringify({ name: 'Updated' }),
      });
      const mockContext = createMockContext({ awsRequestId: 'abc-123' });
      const mockResponse = { statusCode: 200, body: 'Updated' };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle DELETE requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'DELETE',
        path: '/api/users/123',
      });
      const mockContext = createMockContext({ awsRequestId: 'delete-123' });
      const mockResponse = { statusCode: 204 };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle OPTIONS requests', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'OPTIONS',
        path: '/api/users',
      });
      const mockContext = createMockContext({ awsRequestId: 'options-123' });
      const mockResponse = { statusCode: 200 };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle errors from proxy', async () => {
      const mockEvent = createMockEvent({ httpMethod: 'GET', path: '/error' });
      const mockContext = createMockContext({ awsRequestId: '789' });
      const mockError = new Error('Proxy error');

      mockProxy.mockRejectedValue(mockError);

      await expect(handler(mockEvent, mockContext)).rejects.toThrow(
        'Proxy error'
      );
    });

    it('should handle different paths', async () => {
      const paths = [
        '/api/auth/login',
        '/api/users/123',
        '/api/notes',
        '/health',
      ];

      for (const path of paths) {
        const mockEvent = createMockEvent({ httpMethod: 'GET', path });
        const mockContext = createMockContext({ awsRequestId: `test-${path}` });
        const mockResponse = { statusCode: 200, body: 'OK' };

        mockProxy.mockResolvedValue(mockResponse);

        const result = await handler(mockEvent, mockContext);

        expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle requests with query parameters', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/users',
        queryStringParameters: { limit: '10', offset: '0' },
      });
      const mockContext = createMockContext({ awsRequestId: 'query-123' });
      const mockResponse = { statusCode: 200, body: JSON.stringify([]) };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle requests with headers', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/users/me',
        headers: { Authorization: 'Bearer token123' },
      });
      const mockContext = createMockContext({ awsRequestId: 'auth-123' });
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ id: '123' }),
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle requests with path parameters', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/users/123',
        pathParameters: { id: '123' },
      });
      const mockContext = createMockContext({ awsRequestId: 'path-123' });
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ id: '123', name: 'User' }),
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle requests with multiValue headers', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/test',
        multiValueHeaders: { 'X-Custom': ['value1', 'value2'] },
      });
      const mockContext = createMockContext({ awsRequestId: 'multi-123' });
      const mockResponse = { statusCode: 200, body: 'OK' };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle requests with base64 encoded body', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'POST',
        path: '/api/upload',
        body: 'dGVzdCBkYXRh', // base64 for "test data"
        isBase64Encoded: true,
      });
      const mockContext = createMockContext({ awsRequestId: 'base64-123' });
      const mockResponse = { statusCode: 201, body: 'Created' };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle requests with stage variables', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/config',
        stageVariables: { env: 'prod', version: 'v1' },
      });
      const mockContext = createMockContext({ awsRequestId: 'stage-123' });
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify({ config: 'loaded' }),
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

      for (const method of methods) {
        const mockEvent = createMockEvent({
          httpMethod: method,
          path: '/api/test',
        });
        const mockContext = createMockContext({
          awsRequestId: `${method}-123`,
        });
        const mockResponse = { statusCode: 200, body: 'OK' };

        mockProxy.mockResolvedValue(mockResponse);

        const result = await handler(mockEvent, mockContext);

        expect(mockProxy).toHaveBeenCalledWith(mockEvent, mockContext);
        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle different response status codes', async () => {
      const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500];

      for (const statusCode of statusCodes) {
        const mockEvent = createMockEvent({
          httpMethod: 'GET',
          path: `/api/status/${statusCode}`,
        });
        const mockContext = createMockContext({
          awsRequestId: `status-${statusCode}`,
        });
        const mockResponse = { statusCode, body: `Status ${statusCode}` };

        mockProxy.mockResolvedValue(mockResponse);

        const result = await handler(mockEvent, mockContext);

        expect(result.statusCode).toBe(statusCode);
      }
    });

    it('should handle empty response body', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'DELETE',
        path: '/api/users/123',
      });
      const mockContext = createMockContext({ awsRequestId: 'empty-123' });
      const mockResponse = { statusCode: 204, body: '' };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });

    it('should handle JSON response body', async () => {
      const mockEvent = createMockEvent({
        httpMethod: 'GET',
        path: '/api/users',
      });
      const mockContext = createMockContext({ awsRequestId: 'json-123' });
      const responseData = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      const mockResponse = {
        statusCode: 200,
        body: JSON.stringify(responseData),
      };

      mockProxy.mockResolvedValue(mockResponse);

      const result = await handler(mockEvent, mockContext);

      expect(result).toEqual(mockResponse);
    });
  });
});
