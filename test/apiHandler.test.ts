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
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
  ...overrides,
});

describe('apiHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mockApp.close();
  });

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

  it('should handle errors from proxy', async () => {
    const mockEvent = createMockEvent({ httpMethod: 'GET', path: '/error' });
    const mockContext = createMockContext({ awsRequestId: '789' });
    const mockError = new Error('Proxy error');

    mockProxy.mockRejectedValue(mockError);

    await expect(handler(mockEvent, mockContext)).rejects.toThrow(
      'Proxy error'
    );
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
});
