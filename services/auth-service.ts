import { JWTPayload, SignJWT, jwtVerify } from "jose";
import UserLoginsRepository, {
  UserLogin,
} from "@/data/repositories/user-sessions.repository";
import UsersRepository, { UserType } from "@/data/repositories/user.repository";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const JWT_EXPIRE = "2m"; // 1 hour
const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface AuthRequest {
  jwtToken: string;
  ipAddress: string;
  userAgent: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  private static logAndThrow(
    message: string,
    context?: Record<string, unknown>
  ): never {
    logger.error(message, context);
    throw new AuthError(message, context);
  }

  private static handleError(error: unknown, defaultMessage: string): never {
    if (error instanceof AuthError) {
      throw error;
    } else if (error instanceof Error) {
      this.logAndThrow(error.message, { originalError: error.name });
    } else {
      this.logAndThrow(defaultMessage, { unknownError: error });
    }
  }

  private static async updateUserLogin(
    id: string,
    updateData: Partial<UserLogin>
  ): Promise<void> {
    try {
      await UserLoginsRepository.update(id, updateData);
      logger.info("User login updated", { id, ...updateData });
    } catch (error) {
      this.handleError(error, "Failed to update user login");
    }
  }

  static async register(
    name: string,
    email: string,
    password: string,
    type: UserType
  ): Promise<void> {
    try {
      logger.info("Attempting to register new user", { email, type });

      const emailExists = await UsersRepository.getByEmail(email);
      if (emailExists) {
        this.logAndThrow("Email already in use", { email });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await UsersRepository.insert({
        name,
        email,
        type: type,
        password: hashedPassword,
      });

      logger.info("User registered successfully", { email, type });
    } catch (error) {
      this.handleError(error, "Error during user registration");
    }
  }

  static async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ accessToken: string }> {
    try {
      logger.info("Attempting user login", { email });

      const user = await UsersRepository.getByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        this.logAndThrow("Invalid email or password");
      }

      const loginEntry = await UserLoginsRepository.insert({
        userId: user.id,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE),
      });

      const accessToken = await new SignJWT({
        userId: user.id,
        email: user.email,
        type: user.type,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(loginEntry.id.toString())
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRE)
        .sign(JWT_SECRET);

      logger.info("User logged in successfully", { userId: user.id });
      return { accessToken };
    } catch (error) {
      this.handleError(error, "Login failed");
    }
  }

  static async renewToken(
    request: AuthRequest
  ): Promise<{ accessToken: string }> {
    try {
      logger.info("Attempting to renew token", {
        ipAddress: request.ipAddress,
      });

      const payload = await this.validateToken(request.jwtToken);
      const oldUserSession = await this.getValidatedUserLogin(
        payload.jti as string
      );
      if (!oldUserSession) {
        this.logAndThrow("Invalid token: corrupted jti");
      }

      const newRefreshToken = uuidv4();
      await this.updateUserLogin(oldUserSession.id, {
        revokedAt: new Date(),
        revokedBy: newRefreshToken,
        revokedByIp: request.ipAddress,
        revokedReason: "Token refreshed",
      });

      const newLoginEntry = await UserLoginsRepository.insert({
        userId: oldUserSession.userId,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE),
      });

      const newAccessToken = await new SignJWT({
        userId: oldUserSession.userId,
        email: payload.email as string,
        type: payload.type as UserType,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setJti(newLoginEntry.id.toString())
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRE)
        .sign(JWT_SECRET);

      logger.info("Token renewed successfully", {
        userId: oldUserSession.userId,
      });
      return { accessToken: newAccessToken };
    } catch (error) {
      this.handleError(error, "Failed to renew token");
    }
  }

  static async getValidatedUserLogin(id: string): Promise<UserLogin | null> {
    logger.info("Validating user login", { id });

    const existingUserLogin = await UserLoginsRepository.getById(id);

    if (
      existingUserLogin.revokedAt ||
      existingUserLogin.revokedBy ||
      existingUserLogin.revokedReason ||
      existingUserLogin.revokedByIp
    ) {
      logger.warn("User login is revoked", {
        id,
        reason: existingUserLogin.revokedReason,
        revokedBy: existingUserLogin.revokedBy,
      });
      return null;
    }

    return existingUserLogin;
  }

  static async validateToken(jwtToken: string): Promise<JWTPayload> {
    try {
      logger.info("Validating JWT token");

      const { payload } = await jwtVerify(jwtToken, JWT_SECRET, {
        algorithms: ["HS256"],
      });

      if (!payload.jti) {
        this.logAndThrow("Invalid token: missing jti");
      }

      return payload;
    } catch (error) {
      this.handleError(error, "Failed to validate token");
    }
  }

  static async logout(request: AuthRequest): Promise<void> {
    try {
      logger.info("Attempting to log out user", {
        ipAddress: request.ipAddress,
      });

      const payload = await this.validateToken(request.jwtToken);
      const userSession = await this.getValidatedUserLogin(
        payload.jti as string
      );

      if (!userSession) {
        this.logAndThrow("Invalid token: user session not found");
      }

      await this.updateUserLogin(userSession.id, {
        revokedAt: new Date(),
        revokedByIp: request.ipAddress,
        revokedReason: "User logged out",
      });

      logger.info("User logged out successfully", {
        userId: userSession.userId,
      });
    } catch (error) {
      this.handleError(error, "Failed to log out user");
    }
  }
}
