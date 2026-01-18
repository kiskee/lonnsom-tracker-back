import { CreateUserDto } from '../../../src/users/dtos/CreateUserDto';
import { CreateUserRequest } from '../../../src/users/types/User';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('CreateUserDto', () => {
  beforeEach(() => {
    process.env.DEFAULT_IMG = 'https://default-image.com/avatar.png';
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.DEFAULT_IMG;
  });

  it('should create CreateUserDto with all fields', () => {
    const data: CreateUserRequest = {
      id: 'custom-id',
      email: 'test@test.com',
      email_verified: true,
      family_name: 'Doe',
      given_name: 'John',
      name: 'John Doe',
      picture: 'https://example.com/pic.jpg',
      sub: 'google-123',
      password: 'password123',
      createdAt: '2024-01-01T10:00:00.000Z',
      updatedAt: '2024-01-01T11:00:00.000Z',
    };

    const dto = new CreateUserDto(data);

    expect(dto.id).toBe('custom-id');
    expect(dto.email).toBe('test@test.com');
    expect(dto.email_verified).toBe(true);
    expect(dto.family_name).toBe('Doe');
    expect(dto.given_name).toBe('John');
    expect(dto.name).toBe('John Doe');
    expect(dto.picture).toBe('https://example.com/pic.jpg');
    expect(dto.sub).toBe('google-123');
    expect(dto.password).toBe('password123');
    expect(dto.createdAt).toBe('2024-01-01T10:00:00.000Z');
    expect(dto.updatedAt).toBe('2024-01-01T11:00:00.000Z');
  });

  it('should auto-generate id when not provided', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
    };

    const dto = new CreateUserDto(data);

    expect(dto.id).toBe('mock-uuid-123');
  });

  it('should use default values for optional fields', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
    };

    const dto = new CreateUserDto(data);

    expect(dto.email_verified).toBe(false);
    expect(dto.family_name).toBe('');
    expect(dto.given_name).toBe('');
    expect(dto.name).toBe('Test User');
    expect(dto.picture).toBe('https://default-image.com/avatar.png');
  });

  it('should auto-generate timestamps when not provided', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
    };

    const dto = new CreateUserDto(data);

    expect(dto.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should use provided timestamps when given', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
      createdAt: '2024-06-01T12:00:00.000Z',
      updatedAt: '2024-06-01T13:00:00.000Z',
    };

    const dto = new CreateUserDto(data);

    expect(dto.createdAt).toBe('2024-06-01T12:00:00.000Z');
    expect(dto.updatedAt).toBe('2024-06-01T13:00:00.000Z');
  });

  it('should handle missing DEFAULT_IMG environment variable', () => {
    delete process.env.DEFAULT_IMG;

    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
    };

    const dto = new CreateUserDto(data);

    expect(dto.picture).toBe('');
  });

  it('should preserve provided picture over default', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
      picture: 'https://custom-pic.com/avatar.jpg',
    };

    const dto = new CreateUserDto(data);

    expect(dto.picture).toBe('https://custom-pic.com/avatar.jpg');
  });

  it('should handle undefined optional fields', () => {
    const data: CreateUserRequest = {
      email: 'test@test.com',
      name: 'Test User',
      sub: undefined,
      password: undefined,
    };

    const dto = new CreateUserDto(data);

    expect(dto.sub).toBeUndefined();
    expect(dto.password).toBeUndefined();
  });

  it('should create minimal user with required fields only', () => {
    const data: CreateUserRequest = {
      email: 'minimal@test.com',
      name: 'Minimal User',
    };

    const dto = new CreateUserDto(data);

    expect(dto.email).toBe('minimal@test.com');
    expect(dto.name).toBe('Minimal User');
    expect(dto.id).toBe('mock-uuid-123');
    expect(dto.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(dto.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });
});
