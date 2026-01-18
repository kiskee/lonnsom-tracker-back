import jwt from 'jsonwebtoken';
import { jwtMiddleware, AuthenticatedRequest } from '../../src/middlewares/jwtMiddleware';
import { FastifyReply } from 'fastify';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('jwtMiddleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock reply
    mockSend = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ send: mockSend });
    
    mockReply = {
      status: mockStatus
    };

    // Setup mock request
    mockRequest = {
      headers: {}
    };

    // Mock environment variable
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should return 401 when no authorization header is provided', async () => {
    mockRequest.headers = {};

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('should return 401 when authorization header does not start with Bearer', async () => {
    mockRequest.headers = {
      authorization: 'Basic token123'
    };

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('should return 401 when authorization header is empty', async () => {
    mockRequest.headers = {
      authorization: ''
    };

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('should set user in request when token is valid', async () => {
    const mockDecodedToken = { userId: 123, email: 'test@example.com' };
    const mockToken = 'valid-token';
    
    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`
    };

    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, undefined);
    expect(mockRequest.user).toEqual(mockDecodedToken);
    expect(mockStatus).not.toHaveBeenCalled();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', async () => {
    const mockToken = 'invalid-token';
    
    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, undefined);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });

  it('should return 401 when token is expired', async () => {
    const mockToken = 'expired-token';
    
    mockRequest.headers = {
      authorization: `Bearer ${mockToken}`
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, undefined);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });

  it('should handle malformed Bearer token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer'
    };

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  it('should handle Bearer token with empty token part', async () => {
    mockRequest.headers = {
      authorization: 'Bearer '
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await jwtMiddleware(mockRequest as AuthenticatedRequest, mockReply as FastifyReply);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockSend).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });
});