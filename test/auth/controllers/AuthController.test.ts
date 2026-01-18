jest.mock('../../../src/auth/services/authService', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      login: jest.fn(),
      loginGoogle: jest.fn(),
      logout: jest.fn(),
      renewToken: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    })),
  };
});

// ⬇️ imports DESPUÉS de los mocks
import { AuthController } from '../../../src/auth/controllers/AuthController';
import { AuthService } from '../../../src/auth/services/authService';
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let reply: jest.Mocked<FastifyReply>;

  beforeEach(() => {
    controller = new AuthController();
    authService = (controller as any).authService;

    reply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // registerRoutes
  // =========================
  it('should register all auth routes', async () => {
    const fastify = {
      post: jest.fn(),
    } as unknown as FastifyInstance;

    await controller.registerRoutes(fastify);

    expect(fastify.post).toHaveBeenCalledTimes(6);
  });

  // =========================
  // login
  // =========================
  it('should login successfully', async () => {
    const request = {
      body: { email: 'test@test.com', password: '123456' },
    } as FastifyRequest;

    authService.login.mockResolvedValue({ token: 'jwt' } as any);

    await (controller as any).login(request, reply);

    expect(authService.login).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ token: 'jwt' });
  });

  it('should handle login error', async () => {
    const request = {
      body: {},
    } as FastifyRequest;

    authService.login.mockRejectedValue({
      statusCode: 401,
      message: 'Invalid credentials',
    });

    await (controller as any).login(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'Invalid credentials',
    });
  });

  // =========================
  // loginGoogle
  // =========================
  it('should login with google', async () => {
    const request = {
      body: { token: 'google-token' },
    } as FastifyRequest;

    authService.loginGoogle.mockResolvedValue({ token: 'jwt' } as any);

    await (controller as any).loginGoogle(request, reply);

    expect(authService.loginGoogle).toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ token: 'jwt' });
  });

  it('should handle loginGoogle error', async () => {
    const request = {
      body: { token: 'invalid-token' },
    } as FastifyRequest;

    authService.loginGoogle.mockRejectedValue({
      statusCode: 400,
      message: 'Invalid Google token',
    });

    await (controller as any).loginGoogle(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'Invalid Google token',
    });
  });

  // =========================
  // logout
  // =========================
  it('should return 401 if token is missing on logout', async () => {
    const request = {
      headers: {},
    } as FastifyRequest;

    await (controller as any).logout(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Token no proporcionado',
    });
  });

  it('should logout successfully', async () => {
    const request = {
      headers: {
        authorization: 'Bearer token123',
      },
    } as FastifyRequest;

    authService.logout.mockResolvedValue({ success: true } as never);

    await (controller as any).logout(request, reply);

    expect(authService.logout).toHaveBeenCalledWith('token123');
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ success: true });
  });

  it('should handle logout error', async () => {
    const request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as FastifyRequest;

    authService.logout.mockRejectedValue(new Error('Token expired') as never);

    await (controller as any).logout(request, reply);

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'Token expired',
    });
  });

  // =========================
  // renewToken
  // =========================
  it('should return 401 if refreshToken is missing', async () => {
    const request = {
      body: {},
    } as FastifyRequest;

    await (controller as any).renewToken(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Refresh token no proporcionado',
    });
  });

  it('should renew token successfully', async () => {
    const request = {
      body: { refreshToken: 'refresh123' },
    } as FastifyRequest;

    authService.renewToken.mockResolvedValue({ token: 'new-token' } as any);

    await (controller as any).renewToken(request, reply);

    expect(authService.renewToken).toHaveBeenCalledWith('refresh123');
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ token: 'new-token' });
  });

  it('should handle renewToken error', async () => {
    const request = {
      body: { refreshToken: 'expired-refresh' },
    } as FastifyRequest;

    authService.renewToken.mockRejectedValue(
      new Error('Refresh token expired') as any
    );

    await (controller as any).renewToken(request, reply);

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'Refresh token expired',
    });
  });

  // =========================
  // forgotPassword
  // =========================
  it('should return 400 if email param is missing', async () => {
    const request = {
      params: {},
    } as FastifyRequest;

    await (controller as any).forgotPassword(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Email no proporcionado',
    });
  });

  it('should call forgotPassword successfully', async () => {
    const request = {
      params: { email: 'test@test.com' },
    } as FastifyRequest;

    authService.forgotPassword.mockResolvedValue({ sent: true } as any);

    await (controller as any).forgotPassword(request, reply);

    expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ sent: true });
  });

  it('should handle forgotPassword error', async () => {
    const request = {
      params: { email: 'invalid@test.com' },
    } as FastifyRequest;

    authService.forgotPassword.mockRejectedValue({
      statusCode: 404,
      message: 'User not found',
    });

    await (controller as any).forgotPassword(request, reply);

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'User not found',
    });
  });

  // =========================
  // resetPassword
  // =========================
  it('should reset password successfully', async () => {
    const request = {
      body: {
        email: 'test@test.com',
        code: '1234',
        token: 'token',
        newPassword: 'newpass',
      },
    } as FastifyRequest;

    authService.resetPassword.mockResolvedValue({ success: true } as any);

    await (controller as any).resetPassword(request, reply);

    expect(authService.resetPassword).toHaveBeenCalledWith(
      'test@test.com',
      '1234',
      'token',
      'newpass'
    );
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ success: true });
  });

  it('should handle resetPassword error', async () => {
    const request = {
      body: {
        email: 'test@test.com',
        code: 'invalid',
        token: 'token',
        newPassword: 'newpass',
      },
    } as FastifyRequest;

    authService.resetPassword.mockRejectedValue({
      statusCode: 400,
      message: 'Invalid reset code',
    });

    await (controller as any).resetPassword(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      message: 'Error interno',
      error: 'Invalid reset code',
    });
  });
});
