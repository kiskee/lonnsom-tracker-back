export interface User {
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
}

export interface CreateUserRequest {
  id?: string;
  email: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name: string;
  picture?: string;
  sub?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  picture?: string;
  sub?: string;
  password?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name: string;
  picture?: string;
  sub?: string;
  createdAt: string;
  updatedAt: string;
}