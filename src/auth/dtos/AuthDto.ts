export interface GoogleData {
  email: string;
  email_verified: boolean;
  family_name?: string;
  given_name?: string;
  name: string;
  picture?: string;
  sub: string;
}

export class GoogleDto {
  email: string;
  email_verified: boolean;
  family_name?: string;
  given_name?: string;
  name: string;
  picture?: string;
  sub: string;

  constructor(data: GoogleData) {
    this.email = data.email;
    this.email_verified = data.email_verified;
    this.family_name = data.family_name;
    this.given_name = data.given_name;
    this.name = data.name;
    this.picture = data.picture;
    this.sub = data.sub;
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;

  constructor(data: LoginData) {
    this.email = data.email;
    this.password = data.password;
  }
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  code: string;
  email: string;
}

export class ResetPasswordDto {
  token: string;
  newPassword: string;
  code: string;
  email: string;

  constructor(data: ResetPasswordData) {
    this.token = data.token;
    this.newPassword = data.newPassword;
    this.code = data.code;
    this.email = data.email;
  }
}