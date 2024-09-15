import { SignJWT, jwtVerify } from "jose";
import UserLoginsRepository from "@/data/repositories/user-sessions.repository";
import UsersRepository from "@/data/repositories/user.repository";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const JWT_EXPIRE = "1h"; // 1 hour
const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class AuthService {
  static async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: Record<string, string>
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
      deviceInfo, // You might want to parse user agent to get device info
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE),
    });

    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      type: user.type,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(loginEntry.id.toString()) // Use the login entry id as the JTI
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRE)
      .sign(JWT_SECRET);

    return {
      accessToken,
    };
  }

  static async renewToken(
    jwtToken: string,
    {
      ipAddress,
      userAgent,
    }: {
      ipAddress: string;
      userAgent?: string;
    }
  ) {
    const { payload } = await jwtVerify(jwtToken, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!payload.jti) {
      throw new Error("Invalid token");
    }

    const oldUserSession = await UserLoginsRepository.getById(payload.jti);
    if (!oldUserSession) {
      console.log("A corrupted jti was tried");
      throw new Error("Invalid token");
    }

    if (oldUserSession.revokedAt) {
      throw new Error("This token is revoked");
    }

    const newRefreshToken = uuidv4();

    await UserLoginsRepository.update(payload.jti, {
      revokedAt: new Date(),
      revokedBy: newRefreshToken,
      revokedByIp: ipAddress,
      revokedReason: "Token refreshed",
    });

    const newLoginEntry = await UserLoginsRepository.insert({
      userId: oldUserSession.userId,
      ipAddress,
      userAgent,
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

  static async isValid(jti: string) {
    const existingUserLogin = await UserLoginsRepository.getById(jti);

    if (
      existingUserLogin.revokedAt ||
      existingUserLogin.revokedBy ||
      existingUserLogin.revokedReason ||
      existingUserLogin.revokedByIp
    ) {
      console.log("Is revoked");

      return false;
    }

    return true;
  }
}
