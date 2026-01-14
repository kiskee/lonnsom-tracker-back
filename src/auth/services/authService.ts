import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRepository } from "../../users/repository/UserRepository";
import { UserService } from "../../users/services/UserService";
import { LoginDto, GoogleDto } from "../dtos/AuthDto";

const JWT_SECRET = process.env.JWT_SECRET!;

export class AuthService {
  private userRepository: UserRepository;
  private blacklistedTokens: Set<string>;
  private userService: UserService;

  constructor() {
    this.userRepository = new UserRepository();
    this.blacklistedTokens = new Set();
    this.userService = new UserService();
  }

  async login(data: LoginDto) {
    try {
      const user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        const error = new Error("Usuario con este email no existe");
        (error as any).statusCode = 401;
        throw error;
      }

      const isPasswordValid = await this.comparePasswords(
        data.password,
        user.password as string
      );

      if (!isPasswordValid) {
        const error = new Error("Usuario o Contraseña invalidos");
        (error as any).statusCode = 401;
        throw error;
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return {
        user: {
          id: user.id,
          email: user.email,
          picture: user.picture,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginGoogle(data: GoogleDto) {
    try {
      if (!data.email_verified) {
        const error = new Error("Error al intentar entrar con Google");
        (error as any).statusCode = 401;
        throw error;
      }

      let user = await this.userRepository.findByEmail(data.email);

      if (!user) {
        user = await this.userService.createUser(data);
      }

      if (user.sub !== data.sub) {
        const error = new Error("Error al intentar entrar con Google");
        (error as any).statusCode = 401;
        throw error;
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          picture: user.picture,
          name: user.name,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  logout(token: string) {
    this.blacklistedTokens.add(token);
    return { message: "Logout successful" };
  }

  async renewToken(data: any) {
    return { message: "Token renewed", data };
  }

  generateAccessToken(user: any): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "60m",
      }
    );
  }

  generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async resetPassword(
    email: string,
    resetCode: string,
    resetToken: string,
    newPassword: string
  ) {
    try {
      const validation = await this.validateResetCode(
        email,
        resetCode,
        resetToken
      );

      if (!validation.valid) {
        const error = new Error("Código inválido o expirado");
        (error as any).statusCode = 400;
        throw error;
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        const error = new Error("Usuario no encontrado");
        (error as any).statusCode = 404;
        throw error;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.userRepository.update(user.id, { password: hashedPassword });

      return {
        message: "Contraseña actualizada exitosamente",
        email: email,
      };
    } catch (error) {
      console.error("Error en resetPassword:", error);
      throw error;
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        const error = new Error("Usuario con este email no existe");
        (error as any).statusCode = 404;
        throw error;
      }

      const resetCode = this.generateResetCode();
      const resetToken = this.createResetToken(email, user.id, resetCode);

      return {
        message: "Código enviado al correo electrónico",
        email: email,
        resetToken: resetToken,
      };
    } catch (error) {
      console.error("Error en forgotPassword:", error);
      throw error;
    }
  }

  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createResetToken(email: string, userId: string, resetCode: string): string {
    const payload = {
      email: email,
      userId: userId,
      resetCode: resetCode,
      purpose: "password_reset",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 60,
    };

    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
  }

  async validateResetCode(
    email: string,
    inputCode: string,
    resetToken: string
  ) {
    try {
      const decoded = jwt.verify(resetToken, JWT_SECRET) as any;

      if (decoded.purpose !== "password_reset") {
        throw new Error("Token inválido");
      }

      if (decoded.email !== email) {
        throw new Error("Email no coincide");
      }

      if (decoded.resetCode !== inputCode) {
        throw new Error("Código incorrecto");
      }

      return {
        valid: true,
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        const err = new Error("El código ha expirado. Solicita uno nuevo.");
        (err as any).statusCode = 410;
        throw err;
      }

      if (error.name === "JsonWebTokenError") {
        const err = new Error("Código o token inválido");
        (err as any).statusCode = 400;
        throw err;
      }

      throw error;
    }
  }
}
