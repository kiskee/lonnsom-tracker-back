import { UserRepository } from '../repository/UserRepository';
import { UpdateUserDto } from '../dtos/UpdateUserDto';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Un usuario con este correo ya existe');
    }

    const userId = uuidv4();
    const timestamp = new Date().toISOString();

    let password = userData.password;
    let sub = userData.sub;

    // Hash password logic
    if (password && password !== '' && !userData.email_verified) {
      password = await bcrypt.hash(password, 10);
      sub = password;
    } else {
      password = sub;
    }

    const newUser: User = {
      id: userId,
      email: userData.email,
      email_verified: userData.email_verified || false,
      family_name: userData.family_name || '',
      given_name: userData.given_name || '',
      name: userData.name || '',
      picture: userData.picture || process.env.DEFAULT_IMG || '',
      sub: sub,
      password: password,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return await this.userRepository.create(newUser);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async updateUser(userId: string, updateData: UpdateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error('Usuario no encontrado');
    }

    // If email is being changed, check if it already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new Error('Un usuario con este correo ya existe');
      }
    }

    // Create a copy to avoid mutating the original
    const updatePayload = { ...updateData };

    // Hash password if provided
    if (updatePayload.password) {
      updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
    }

    // Add updated timestamp
    updatePayload.updatedAt = new Date().toISOString();

    const updateDto = new UpdateUserDto(updatePayload);

    await this.userRepository.update(userId, updateDto);
    return await this.userRepository.findById(userId) as User;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await this.userRepository.delete(userId);
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return user;
  }
}