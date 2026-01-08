import { v4 as uuidv4 } from 'uuid';
import { CreateUserRequest, User } from '../types/User';

export class CreateUserDto implements User {
  id: string;
  email: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name: string;
  picture?: string;
  sub?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: CreateUserRequest) {
    // Generate UUID and timestamp in service, not DTO
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.email_verified = data.email_verified || false;
    this.family_name = data.family_name || '';
    this.given_name = data.given_name || '';
    this.name = data.name || '';
    this.picture = data.picture || process.env.DEFAULT_IMG || '';
    this.sub = data.sub;
    this.password = data.password;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}