import { JWTPayload, SignJWT, jwtVerify } from "jose";
import UserLoginsRepository, {
  UserLogin,
} from "@/data/repositories/user-sessions.repository";
import UsersRepository from "@/data/repositories/user.repository";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const JWT_EXPIRE = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface AuthRequest {
  jwtToken: string;
  ipAddress: string;
  userAgent: string;
}
export class AuthService {
  static async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string
  ) {
    // Find the user by email
    const user = await UsersRepository.getByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
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

    return {
      accessToken,
    };
  }

  static async renewToken(request: AuthRequest) {
    const payload = await this.validateToken(request.jwtToken);
    const oldUserSession = await this.getValidatedUserLogin(payload.jti!);
    if (!oldUserSession) {
      console.log("A corrupted jti was tried");
      throw new Error("Invalid token");
    }

    const newRefreshToken = uuidv4();
    await UserLoginsRepository.update(oldUserSession.id, {
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
      email: payload.email,
      type: payload.type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(newLoginEntry.id.toString())
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRE)
      .sign(JWT_SECRET);

    return {
      accessToken: newAccessToken,
    };
  }

  static async getValidatedUserLogin(id: string): Promise<UserLogin | null> {
    const existingUserLogin = await UserLoginsRepository.getById(id);

    if (
      existingUserLogin.revokedAt ||
      existingUserLogin.revokedBy ||
      existingUserLogin.revokedReason ||
      existingUserLogin.revokedByIp
    ) {
      console.log(
        `Is revoked: ${existingUserLogin.revokedReason} by ${existingUserLogin.revokedBy}`
      );

      return null;
    }

    return existingUserLogin;
  }

  static async validateToken(jwtToken: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(jwtToken, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!payload.jti) {
      throw new Error("Invalid token");
    }

    return payload;
  }

  static async logout(request: AuthRequest) {
    const payload = await this.validateToken(request.jwtToken);
    const userSession = await this.getValidatedUserLogin(payload.jti!);
    if (!userSession) {
      throw new Error("Invalid token");
    }

    await UserLoginsRepository.update(userSession.id, {
      revokedAt: new Date(),
      ipAddress: userSession.ipAddress,
      userAgent: userSession.userAgent,
      revokedByIp: request.ipAddress,
      revokedReason: "User logged out",
    });
  }
}
