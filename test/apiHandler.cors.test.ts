/* eslint-disable no-undef */

// Test específico para cubrir el middleware CORS del apiHandler
describe('apiHandler CORS middleware', () => {
  let mockApp: any;
  let corsMiddleware: any;

  beforeAll(() => {
    // Mock fastify antes de importar
    mockApp = {
      addHook: jest.fn((event, handler) => {
        if (event === 'preHandler') {
          corsMiddleware = handler;
        }
      }),
      logger: true,
    };

    jest.doMock('fastify', () => jest.fn(() => mockApp));
    jest.doMock('@fastify/aws-lambda', () => jest.fn(() => jest.fn()));
    jest.doMock('../src/auth/controllers/AuthController', () => ({
      AuthController: jest.fn().mockImplementation(() => ({
        registerRoutes: jest.fn(),
      })),
    }));
    jest.doMock('../src/users/controllers/UserController', () => ({
      UserController: jest.fn().mockImplementation(() => ({
        registerRoutes: jest.fn(),
      })),
    }));
    jest.doMock('../src/notes/controllers/NoteController', () => ({
      NoteController: jest.fn().mockImplementation(() => ({
        registerRoutes: jest.fn(),
      })),
    }));

    // Importar el módulo para ejecutar el código de inicialización

    require('../src/apiHandler');
  });

  afterAll(() => {
    jest.resetModules();
  });

  it('should register CORS middleware', () => {
    expect(mockApp.addHook).toHaveBeenCalledWith(
      'preHandler',
      expect.any(Function)
    );
    expect(corsMiddleware).toBeDefined();
  });

  it('should set CORS headers for regular requests', async () => {
    const mockRequest = { method: 'GET' };
    const mockReply = {
      header: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await corsMiddleware(mockRequest, mockReply);

    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle OPTIONS requests', async () => {
    const mockRequest = { method: 'OPTIONS' };
    const mockReply = {
      header: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await corsMiddleware(mockRequest, mockReply);

    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      '*'
    );
    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    expect(mockReply.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle POST requests without sending response', async () => {
    const mockRequest = { method: 'POST' };
    const mockReply = {
      header: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await corsMiddleware(mockRequest, mockReply);

    expect(mockReply.header).toHaveBeenCalledTimes(3);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
