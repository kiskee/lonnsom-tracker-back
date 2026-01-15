// ==========================
// MOCKS (SIEMPRE ARRIBA)
// ==========================
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("../../../src/users/repository/UserRepository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
      update: jest.fn(),
    })),
  };
});

jest.mock("../../../src/users/services/UserService", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      createUser: jest.fn(),
    })),
  };
});

// ==========================
// IMPORTS
// ==========================
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AuthService } from "../../../src/auth/services/authService";
import { UserRepository } from "../../../src/users/repository/UserRepository";
import { UserService } from "../../../src/users/services/UserService";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: "1",
    email: "test@test.com",
    password: "hashed",
    role: "user",
    name: "Test",
    picture: "pic",
    sub: "google-sub",
  };

  beforeEach(() => {
    service = new AuthService();
    userRepository = (service as any).userRepository;
    userService = (service as any).userService;

    jest.clearAllMocks();
  });

  // ==========================
  // login
  // ==========================
  it("should login successfully", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("jwt-token");

    const result = await service.login({
      email: mockUser.email,
      password: "123456",
    } as any);

    expect(result.accessToken).toBe("jwt-token");
    expect(result.refreshToken).toBe("jwt-token");
    expect(result.user.email).toBe(mockUser.email);
  });

  it("should throw error if user does not exist", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: "x", password: "x" } as any)
    ).rejects.toHaveProperty("statusCode", 401);
  });

  it("should throw error if password is invalid", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: "x", password: "x" } as any)
    ).rejects.toHaveProperty("statusCode", 401);
  });

  // ==========================
  // loginGoogle
  // ==========================
  it("should login with google existing user", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    (jwt.sign as jest.Mock).mockReturnValue("jwt");

    const result = await service.loginGoogle({
      email_verified: true,
      email: mockUser.email,
      sub: mockUser.sub,
    } as any);

    expect(result.accessToken).toBe("jwt");
  });

  it("should create user if not exists (google)", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userService.createUser.mockResolvedValue(mockUser as any);
    (jwt.sign as jest.Mock).mockReturnValue("jwt");

    const result = await service.loginGoogle({
      email_verified: true,
      email: mockUser.email,
      sub: mockUser.sub,
    } as any);

    expect(userService.createUser).toHaveBeenCalled();
    expect(result.accessToken).toBe("jwt");
  });

  it("should fail google login if email not verified", async () => {
    await expect(
      service.loginGoogle({ email_verified: false } as any)
    ).rejects.toHaveProperty("statusCode", 401);
  });

  // ==========================
  // logout
  // ==========================
  it("should blacklist token on logout", () => {
    const result = service.logout("token123");
    expect(result.message).toBe("Logout successful");
  });

  // ==========================
  // renewToken
  // ==========================
  it("should renew token", async () => {
    const result = await service.renewToken("refresh");
    expect(result.message).toBe("Token renewed");
  });

  // ==========================
  // resetPassword
  // ==========================
  it("should reset password successfully", async () => {
    jest
      .spyOn(service, "validateResetCode")
      .mockResolvedValue({ valid: true } as any);

    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    (bcrypt.hash as jest.Mock).mockResolvedValue("new-hash");

    const result = await service.resetPassword(
      mockUser.email,
      "123456",
      "token",
      "newpass"
    );

    expect(userRepository.update).toHaveBeenCalled();
    expect(result.message).toContain("Contraseña actualizada");
  });

  it("should throw if reset code invalid", async () => {
    jest
      .spyOn(service, "validateResetCode")
      .mockResolvedValue({ valid: false } as any);

    await expect(
      service.resetPassword("x", "x", "x", "x")
    ).rejects.toHaveProperty("statusCode", 400);
  });

  // ==========================
  // forgotPassword
  // ==========================
  it("should send reset code", async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    jest.spyOn(service, "generateResetCode").mockReturnValue("123456");
    jest.spyOn(service, "createResetToken").mockReturnValue("reset-token");

    const result = await service.forgotPassword(mockUser.email);

    expect(result.resetToken).toBe("reset-token");
  });

  it("should throw if user not found on forgotPassword", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.forgotPassword("x@test.com")
    ).rejects.toHaveProperty("statusCode", 404);
  });

  // ==========================
  // validateResetCode
  // ==========================
  it("should validate reset code successfully", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      purpose: "password_reset",
      email: mockUser.email,
      resetCode: "123456",
      userId: mockUser.id,
    });

    const result = await service.validateResetCode(
      mockUser.email,
      "123456",
      "token"
    );

    expect(result.valid).toBe(true);
  });

  it("should throw expired token error", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      const err: any = new Error();
      err.name = "TokenExpiredError";
      throw err;
    });

    await expect(
      service.validateResetCode("x", "x", "x")
    ).rejects.toHaveProperty("statusCode", 410);
  });
});
