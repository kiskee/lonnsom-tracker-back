jest.mock('../../../src/users/services/UserService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserByEmail: jest.fn(),
    })),
  };
});

import { UserController } from '../../../src/users/controllers/UserController';
import { UserService } from '../../../src/users/services/UserService';
import { FastifyReply, FastifyRequest, FastifyInstance } from 'fastify';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let reply: jest.Mocked<FastifyReply>;

  beforeEach(() => {
    controller = new UserController();
    userService = (controller as any).userService;

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
  it('should register all user routes', async () => {
    const fastify = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as unknown as FastifyInstance;

    await controller.registerRoutes(fastify);

    expect(fastify.post).toHaveBeenCalledTimes(1);
    expect(fastify.get).toHaveBeenCalledTimes(3);
    expect(fastify.put).toHaveBeenCalledTimes(1);
    expect(fastify.delete).toHaveBeenCalledTimes(1);
  });

  // =========================
  // createUser
  // =========================
  it('should create user successfully', async () => {
    const request = {
      body: {
        email: 'test@test.com',
        name: 'Test User',
        password: '123456',
      },
    } as FastifyRequest;

    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      password: 'hashedPassword',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };

    userService.createUser.mockResolvedValue(mockUser as any);

    await (controller as any).createUser(request, reply);

    expect(userService.createUser).toHaveBeenCalledWith(request.body);
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    });
  });

  it('should handle createUser error', async () => {
    const request = {
      body: { email: 'test@test.com' },
    } as FastifyRequest;

    userService.createUser.mockRejectedValue(new Error('Email already exists'));

    await (controller as any).createUser(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
  });

  // =========================
  // getAllUsers
  // =========================
  it('should get all users successfully', async () => {
    const request = {} as FastifyRequest;
    const mockUsers = [
      {
        id: '1',
        email: 'user1@test.com',
        name: 'User 1',
        password: 'hash1',
      },
      {
        id: '2',
        email: 'user2@test.com',
        name: 'User 2',
        password: 'hash2',
      },
    ];

    userService.getAllUsers.mockResolvedValue(mockUsers as any);

    await (controller as any).getAllUsers(request, reply);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(reply.send).toHaveBeenCalledWith([
      { id: '1', email: 'user1@test.com', name: 'User 1' },
      { id: '2', email: 'user2@test.com', name: 'User 2' },
    ]);
  });

  it('should handle getAllUsers error', async () => {
    const request = {} as FastifyRequest;

    userService.getAllUsers.mockRejectedValue(new Error('Database error'));

    await (controller as any).getAllUsers(request, reply);

    expect(reply.code).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Database error' });
  });

  // =========================
  // getUserById
  // =========================
  it('should get user by id successfully', async () => {
    const request = {
      params: { id: '1' },
    } as FastifyRequest;

    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      password: 'hashedPassword',
    };

    userService.getUserById.mockResolvedValue(mockUser as any);

    await (controller as any).getUserById(request, reply);

    expect(userService.getUserById).toHaveBeenCalledWith('1');
    expect(reply.send).toHaveBeenCalledWith({
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
    });
  });

  it('should handle getUserById error', async () => {
    const request = {
      params: { id: '999' },
    } as FastifyRequest;

    userService.getUserById.mockRejectedValue(new Error('User not found'));

    await (controller as any).getUserById(request, reply);

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: 'User not found' });
  });

  // =========================
  // updateUser
  // =========================
  it('should update user successfully', async () => {
    const request = {
      params: { id: '1' },
      body: { name: 'Updated Name' },
    } as FastifyRequest;

    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Updated Name',
      password: 'hashedPassword',
    };

    userService.updateUser.mockResolvedValue(mockUser as any);

    await (controller as any).updateUser(request, reply);

    expect(userService.updateUser).toHaveBeenCalledWith('1', {
      name: 'Updated Name',
    });
    expect(reply.send).toHaveBeenCalledWith({
      id: '1',
      email: 'test@test.com',
      name: 'Updated Name',
    });
  });

  it('should handle updateUser error', async () => {
    const request = {
      params: { id: '1' },
      body: { email: 'existing@test.com' },
    } as FastifyRequest;

    userService.updateUser.mockRejectedValue(new Error('Email already exists'));

    await (controller as any).updateUser(request, reply);

    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({ error: 'Email already exists' });
  });

  // =========================
  // deleteUser
  // =========================
  it('should delete user successfully', async () => {
    const request = {
      params: { id: '1' },
    } as FastifyRequest;

    userService.deleteUser.mockResolvedValue(undefined);

    await (controller as any).deleteUser(request, reply);

    expect(userService.deleteUser).toHaveBeenCalledWith('1');
    expect(reply.code).toHaveBeenCalledWith(204);
    expect(reply.send).toHaveBeenCalledWith();
  });

  it('should handle deleteUser error', async () => {
    const request = {
      params: { id: '999' },
    } as FastifyRequest;

    userService.deleteUser.mockRejectedValue(new Error('User not found'));

    await (controller as any).deleteUser(request, reply);

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: 'User not found' });
  });

  // =========================
  // getUserByEmail
  // =========================
  it('should get user by email successfully', async () => {
    const request = {
      params: { email: 'test@test.com' },
    } as FastifyRequest;

    const mockUser = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      password: 'hashedPassword',
    };

    userService.getUserByEmail.mockResolvedValue(mockUser as any);

    await (controller as any).getUserByEmail(request, reply);

    expect(userService.getUserByEmail).toHaveBeenCalledWith('test@test.com');
    expect(reply.send).toHaveBeenCalledWith({
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
    });
  });

  it('should handle getUserByEmail error', async () => {
    const request = {
      params: { email: 'notfound@test.com' },
    } as FastifyRequest;

    userService.getUserByEmail.mockRejectedValue(new Error('User not found'));

    await (controller as any).getUserByEmail(request, reply);

    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: 'User not found' });
  });
});
