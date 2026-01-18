import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { LoginDto, GoogleDto, ResetPasswordDto } from '../dtos/AuthDto';
import {
  loginSchema,
  googleSchema,
  resetPasswordSchema,
} from '../schemas/authSchema';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // Login
    fastify.post('/auth/login', {
      schema: { body: loginSchema },
      handler: this.login.bind(this),
    });

    // Login Google
    fastify.post('/auth/login-google', {
      schema: { body: googleSchema },
      handler: this.loginGoogle.bind(this),
    });

    // Logout
    fastify.post('/auth/logout', {
      handler: this.logout.bind(this),
    });

    // Renew Token
    fastify.post('/auth/renew-token', {
      handler: this.renewToken.bind(this),
    });

    // Forgot Password
    fastify.post('/auth/forgot-password/:email', {
      handler: this.forgotPassword.bind(this),
    });

    // Reset Password
    fastify.post('/auth/reset-password', {
      schema: { body: resetPasswordSchema },
      handler: this.resetPassword.bind(this),
    });
  }

  private async login(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ): Promise<void> {
    const dto = new LoginDto(request.body as any);

    try {
      const result = await this.authService.login(dto);

      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(error.statusCode || 500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }

  private async loginGoogle(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ): Promise<void> {
    const dto = new GoogleDto(request.body as any);

    try {
      const result = await this.authService.loginGoogle(dto);
      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(error.statusCode || 500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }

  private async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.code(401).send({ message: 'Token no proporcionado' });
    }

    try {
      const result = await this.authService.logout(token);
      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }

  private async renewToken(
    request: FastifyRequest<{ Body: { refreshToken?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { refreshToken } = request.body || {};

    if (!refreshToken) {
      return reply
        .code(401)
        .send({ message: 'Refresh token no proporcionado' });
    }

    try {
      const result = await this.authService.renewToken(refreshToken);
      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }

  private async forgotPassword(
    request: FastifyRequest<{ Params: { email: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const email = request.params.email;

    if (!email) {
      return reply.code(400).send({ message: 'Email no proporcionado' });
    }

    try {
      const result = await this.authService.forgotPassword(email);
      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(error.statusCode || 500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }

  private async resetPassword(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
  ): Promise<void> {
    const dto = new ResetPasswordDto(request.body as any);

    try {
      const result = await this.authService.resetPassword(
        dto.email,
        dto.code,
        dto.token,
        dto.newPassword
      );
      reply.code(200).send(result);
    } catch (error: any) {
      reply.code(error.statusCode || 500).send({
        message: 'Error interno',
        error: error.message,
      });
    }
  }
}
