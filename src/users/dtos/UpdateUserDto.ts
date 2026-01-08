import { UpdateUserRequest } from '../types/User';

export class UpdateUserDto {
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  picture?: string;
  sub?: string;
  password?: string;
  updatedAt: string;

  constructor(data: UpdateUserRequest) {
    if (data.email) this.email = data.email;
    if (data.email_verified !== undefined) this.email_verified = data.email_verified;
    if (data.family_name) this.family_name = data.family_name;
    if (data.given_name) this.given_name = data.given_name;
    if (data.name) this.name = data.name;
    if (data.picture) this.picture = data.picture;
    if (data.sub) this.sub = data.sub;
    if (data.password) this.password = data.password;
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
}