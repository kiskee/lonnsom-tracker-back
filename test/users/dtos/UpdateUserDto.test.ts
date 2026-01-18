import { UpdateUserDto } from '../../../src/users/dtos/UpdateUserDto';
import { UpdateUserRequest } from '../../../src/users/types/User';

describe('UpdateUserDto', () => {
  beforeEach(() => {
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue('2024-01-01T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create UpdateUserDto with all fields', () => {
    const data: UpdateUserRequest = {
      email: 'test@test.com',
      email_verified: true,
      family_name: 'Doe',
      given_name: 'John',
      name: 'John Doe',
      picture: 'https://example.com/pic.jpg',
      sub: 'google-123',
      password: 'newPassword',
      updatedAt: '2024-01-01T12:00:00.000Z',
    };

    const dto = new UpdateUserDto(data);

    expect(dto.email).toBe('test@test.com');
    expect(dto.email_verified).toBe(true);
    expect(dto.family_name).toBe('Doe');
    expect(dto.given_name).toBe('John');
    expect(dto.name).toBe('John Doe');
    expect(dto.picture).toBe('https://example.com/pic.jpg');
    expect(dto.sub).toBe('google-123');
    expect(dto.password).toBe('newPassword');
    expect(dto.updatedAt).toBe('2024-01-01T12:00:00.000Z');
  });

  it('should only include provided fields', () => {
    const data: UpdateUserRequest = {
      name: 'Updated Name',
      email: 'updated@test.com',
    };

    const dto = new UpdateUserDto(data);

    expect(dto.name).toBe('Updated Name');
    expect(dto.email).toBe('updated@test.com');
    expect(dto.email_verified).toBeUndefined();
    expect(dto.family_name).toBeUndefined();
    expect(dto.given_name).toBeUndefined();
    expect(dto.picture).toBeUndefined();
    expect(dto.sub).toBeUndefined();
    expect(dto.password).toBeUndefined();
    expect(dto.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should auto-generate updatedAt when not provided', () => {
    const data: UpdateUserRequest = {
      name: 'Test User',
    };

    const dto = new UpdateUserDto(data);

    expect(dto.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('should use provided updatedAt when given', () => {
    const customTime = '2024-12-31T23:59:59.999Z';
    const data: UpdateUserRequest = {
      name: 'Test User',
      updatedAt: customTime,
    };

    const dto = new UpdateUserDto(data);

    expect(dto.updatedAt).toBe(customTime);
  });

  it('should handle email_verified as false', () => {
    const data: UpdateUserRequest = {
      email_verified: false,
    };

    const dto = new UpdateUserDto(data);

    expect(dto.email_verified).toBe(false);
  });

  it('should handle empty strings correctly', () => {
    const data: UpdateUserRequest = {
      email: '',
      name: '',
      family_name: '',
    };

    const dto = new UpdateUserDto(data);

    expect(dto.email).toBeUndefined();
    expect(dto.name).toBeUndefined();
    expect(dto.family_name).toBeUndefined();
  });

  it('should create dto with minimal data', () => {
    const data: UpdateUserRequest = {};

    const dto = new UpdateUserDto(data);

    expect(dto.email).toBeUndefined();
    expect(dto.name).toBeUndefined();
    expect(dto.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });
});
