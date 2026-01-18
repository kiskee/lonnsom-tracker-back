const mockSend = jest.fn();

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({ send: mockSend })),
  },
  PutCommand: jest.fn(),
  GetCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
}));

import { UserRepository } from '../../../src/users/repository/UserRepository';
import { User } from '../../../src/users/types/User';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    process.env.USERS_TABLE = 'test-users-table';
    repository = new UserRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData: User = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockSend.mockResolvedValueOnce({});

      const result = await repository.create(userData);

      expect(PutCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Item: userData,
      });
      expect(mockSend).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const userId = '123';
      const mockUser: User = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockSend.mockResolvedValueOnce({ Item: mockUser });

      const result = await repository.findById(userId);

      expect(GetCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockSend.mockResolvedValueOnce({ Item: undefined });

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      const email = 'test@test.com';
      const mockUser: User = {
        id: '123',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockSend.mockResolvedValueOnce({ Items: [mockUser] });

      const result = await repository.findByEmail(email);

      expect(QueryCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockSend.mockResolvedValueOnce({ Items: [] });

      const result = await repository.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });

    it('should return null when Items is undefined', async () => {
      mockSend.mockResolvedValueOnce({ Items: undefined });

      const result = await repository.findByEmail('test@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          password: 'hash1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          password: 'hash2',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockSend.mockResolvedValueOnce({ Items: mockUsers });

      const result = await repository.findAll();

      expect(ScanCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      mockSend.mockResolvedValueOnce({ Items: undefined });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '123';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@test.com',
      };

      mockSend.mockResolvedValueOnce({});

      await repository.update(userId, updateData);

      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { id: userId },
        UpdateExpression: 'SET #name = :name, #email = :email',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#email': 'email',
        },
        ExpressionAttributeValues: {
          ':name': 'Updated Name',
          ':email': 'updated@test.com',
        },
      });
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle single field update', async () => {
      const userId = '123';
      const updateData = { name: 'New Name' };

      mockSend.mockResolvedValueOnce({});

      await repository.update(userId, updateData);

      expect(UpdateCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { id: userId },
        UpdateExpression: 'SET #name = :name',
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ExpressionAttributeValues: {
          ':name': 'New Name',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const userId = '123';
      mockSend.mockResolvedValueOnce({});

      await repository.delete(userId);

      expect(DeleteCommand).toHaveBeenCalledWith({
        TableName: 'test-users-table',
        Key: { id: userId },
      });
      expect(mockSend).toHaveBeenCalled();
    });
  });
});
