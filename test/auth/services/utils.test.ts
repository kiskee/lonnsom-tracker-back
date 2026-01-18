// Mock process.env before importing
process.env.JWT_SECRET = 'test-secret';

import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';
import { getUserFromRequest } from '../../../src/auth/services/utils';

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

afterEach(() => {
  jest.clearAllMocks();
});

describe('getUserFromRequest', () => {
  const mockRequest = (authHeader?: string): FastifyRequest => ({
    headers: {
      authorization: authHeader
    }
  } as FastifyRequest);

  it('should return decoded user when valid Bearer token is provided', () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    mockedJwt.verify.mockReturnValue(mockUser as any);

    const req = mockRequest('Bearer valid-token');
    const result = getUserFromRequest(req);

    expect(mockedJwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(result).toEqual(mockUser);
  });

  it('should return null when no authorization header is provided', () => {
    const req = mockRequest();
    const result = getUserFromRequest(req);

    expect(mockedJwt.verify).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when authorization header does not start with Bearer', () => {
    const req = mockRequest('Basic some-token');
    const result = getUserFromRequest(req);

    expect(mockedJwt.verify).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when Bearer token is empty', () => {
    const req = mockRequest('Bearer ');
    const result = getUserFromRequest(req);

    expect(mockedJwt.verify).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when jwt.verify throws an error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockRequest('Bearer invalid-token');
    const result = getUserFromRequest(req);

    expect(mockedJwt.verify).toHaveBeenCalledWith('invalid-token', 'test-secret');
    expect(consoleSpy).toHaveBeenCalledWith('Error al obtener usuario desde el request:', 'Invalid token');
    expect(result).toBeNull();

    consoleSpy.mockRestore();
  });
});