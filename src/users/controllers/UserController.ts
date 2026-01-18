import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  preHandlerHookHandler,
} from 'fastify';
import { UserService } from '../services/UserService';
import { CreateUserRequest, UpdateUserRequest } from '../types/User';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  getUserByEmailSchema,
} from '../schemas/userSchema';
import { jwtMiddleware } from '../../middlewares/jwtMiddleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async registerRoutes(fastify: FastifyInstance): Promise<void> {
    // Create user
    fastify.post('/users', {
      schema: createUserSchema,
      handler: this.createUser.bind(this),
    });

    // Get all users (protected route)
    fastify.get('/users', {
      //preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.getAllUsers.bind(this),
    });

    fastify.get('/users/email/:email', {
      schema: getUserByEmailSchema,
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.getUserByEmail.bind(this),
    });

    // Get user by ID (protected route)
    fastify.get('/users/:id', {
      schema: getUserSchema,
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.getUserById.bind(this),
    });

    // Update user (protected route)
    fastify.put('/users/:id', {
      schema: updateUserSchema,
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.updateUser.bind(this),
    });

    // Delete user (protected route)
    fastify.delete('/users/:id', {
      schema: getUserSchema,
      preHandler: jwtMiddleware as preHandlerHookHandler,
      handler: this.deleteUser.bind(this),
    });
  }

  private async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.userService.createUser(request.body);
      const { password, ...userResponse } = user;
      reply.code(201).send(userResponse);
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  }

  private async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers();
      const usersResponse = users.map(({ password, ...user }) => user);
      reply.send(usersResponse);
    } catch (error) {
      reply.code(500).send({ error: (error as Error).message });
    }
  }

  private async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.userService.getUserById(request.params.id);
      const { password, ...userResponse } = user;
      reply.send(userResponse);
    } catch (error) {
      reply.code(404).send({ error: (error as Error).message });
    }
  }

  private async updateUser(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateUserRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.userService.updateUser(
        request.params.id,
        request.body
      );
      const { password, ...userResponse } = user;
      reply.send(userResponse);
    } catch (error) {
      reply.code(400).send({ error: (error as Error).message });
    }
  }

  private async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      await this.userService.deleteUser(request.params.id);
      reply.code(204).send();
    } catch (error) {
      reply.code(404).send({ error: (error as Error).message });
    }
  }

  private async getUserByEmail(
    request: FastifyRequest<{ Params: { email: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = await this.userService.getUserByEmail(request.params.email);
      const { password, ...userResponse } = user;
      reply.send(userResponse);
    } catch (error) {
      reply.code(404).send({ error: (error as Error).message });
    }
  }
}
