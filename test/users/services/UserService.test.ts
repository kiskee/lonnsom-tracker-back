import { UserService } from '../../../src/users/services/UserService';
import { UserRepository } from '../../../src/users/repository/UserRepository';
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../../../src/users/types/User';
import bcrypt from 'bcryptjs';

jest.mock('../../../src/users/repository/UserRepository');
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    userService = new UserService();
    (userService as any).userRepository = mockUserRepository;

    jest.clearAllMocks();

    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully with password hashing', async () => {
      const userData: CreateUserRequest = {
        email: 'test@test.com',
        name: 'Test User',
        password: 'plainPassword',
        email_verified: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      } as User);

      const result = await userService.createUser(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'test@test.com'
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mock-uuid',
          email: 'test@test.com',
          name: 'Test User',
          password: 'hashedPassword',
          sub: 'hashedPassword',
          email_verified: false,
        })
      );
      expect(result.id).toBe('mock-uuid');
    });

    it('should create user with sub as password when email_verified is true', async () => {
      const userData: CreateUserRequest = {
        email: 'test@test.com',
        name: 'Test User',
        sub: 'google-sub',
        email_verified: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        email: 'test@test.com',
        name: 'Test User',
        password: 'google-sub',
        sub: 'google-sub',
      } as User);

      await userService.createUser(userData);

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'google-sub',
          sub: 'google-sub',
        })
      );
    });

    it('should throw error when user already exists', async () => {
      const userData: CreateUserRequest = {
        email: 'existing@test.com',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: 'existing@test.com',
      } as User);

      await expect(userService.createUser(userData)).rejects.toThrow(
        'Un usuario con este correo ya existe'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 'user123';
      const expectedUser: User = {
        id: userId,
        email: 'test@test.com',
        name: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockUserRepository.findById.mockResolvedValue(expectedUser);

      const result = await userService.getUserById(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('nonexistent')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const expectedUsers: User[] = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(expectedUsers);

      const result = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user123';
      const updateData: UpdateUserRequest = { name: 'Updated Name' };
      const existingUser: User = {
        id: userId,
        email: 'test@test.com',
        name: 'Old Name',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      const updatedUser: User = { ...existingUser, name: 'Updated Name' };

      mockUserRepository.findById.mockResolvedValueOnce(existingUser);
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findById.mockResolvedValueOnce(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          name: 'Updated Name',
          updatedAt: '2024-01-01T00:00:00.000Z',
        })
      );
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating', async () => {
      const userId = 'user123';
      const updateData: UpdateUserRequest = { password: 'newPassword' };
      const existingUser: User = {
        id: userId,
        email: 'test@test.com',
        name: 'User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockUserRepository.findById.mockResolvedValueOnce(existingUser);
      (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findById.mockResolvedValueOnce(existingUser);

      await userService.updateUser(userId, updateData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          password: 'hashedNewPassword',
        })
      );
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(
        userService.updateUser('nonexistent', { name: 'New Name' })
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error when email already exists', async () => {
      const userId = 'user123';
      const updateData: UpdateUserRequest = { email: 'existing@test.com' };
      const existingUser: User = {
        id: userId,
        email: 'old@test.com',
        name: 'User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };
      const emailUser: User = {
        id: 'other-user',
        email: 'existing@test.com',
        name: 'Other User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.findByEmail.mockResolvedValue(emailUser);

      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(
        'Un usuario con este correo ya existe'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';
      const existingUser: User = {
        id: userId,
        email: 'test@test.com',
        name: 'User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await userService.deleteUser(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('nonexistent')).rejects.toThrow(
        'Usuario no encontrado'
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const email = 'test@test.com';
      const expectedUser: User = {
        id: 'user123',
        email,
        name: 'Test User',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser);

      const result = await userService.getUserByEmail(email);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedUser);
    });

    it('should throw error when user not found by email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        userService.getUserByEmail('notfound@test.com')
      ).rejects.toThrow('Usuario no encontrado');
    });
  });
});
