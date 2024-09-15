import { eq, and, gte, desc } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { userLogins } from "../schema";
import { db } from "../db";

interface CreateUserLoginParams {
  userId: number;
  ipAddress: string;
  userAgent: string;
  deviceInfo: any;
}

interface TokenPayload {
  userId: number;
  jti: string;
}

/**
 * Repository class for managing user logins and authentication tokens.
 */
export class UserLoginRepository {
  private static async generateTokens(userId: number): Promise<{
    refreshToken: string;
    accessToken: string;
  }> {
    const jti = crypto.randomUUID();
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const refreshToken = await new SignJWT({ userId, jti })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const accessToken = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .setJti(jti)
      .sign(secret);

    return { refreshToken, accessToken };
  }

  static async createUserLogin({
    userId,
    ipAddress,
    userAgent,
    deviceInfo,
  }: CreateUserLoginParams) {
    const { refreshToken, accessToken } = await this.generateTokens(userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [userLogin] = await db
      .insert(userLogins)
      .values({
        userId,
        refreshToken,
        accessToken,
        ipAddress,
        userAgent,
        deviceInfo,
        expiresAt,
      })
      .returning();

    return { refreshToken, accessToken, userLogin };
  }

  static async validateLogin(refreshToken: string): Promise<boolean> {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(refreshToken, secret);
      const decoded = payload as TokenPayload;

      const [userLogin] = await db
        .select()
        .from(userLogins)
        .where(
          and(
            eq(userLogins.userId, decoded.userId),
            eq(userLogins.isValid, true),
            gte(userLogins.expiresAt, new Date())
          )
        )
        .limit(1);

      return !!userLogin && userLogin.refreshToken === refreshToken;
    } catch (error) {
      return false;
    }
  }

  static async renew(
    currentRefreshToken: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: any
  ) {
    const isValid = await this.validateLogin(currentRefreshToken);
    if (!isValid) {
      throw new Error("Invalid refresh token");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(currentRefreshToken, secret);
    const decoded = payload as TokenPayload;

    await this.revokeUserLogin(currentRefreshToken, "Renewed", ipAddress);

    return this.createUserLogin({
      userId: decoded.userId,
      ipAddress,
      userAgent,
      deviceInfo,
    });
  }

  static async revokeUserLogin(
    refreshToken: string,
    reason: string,
    ipAddress: string
  ) {
    const [revokedLogin] = await db
      .update(userLogins)
      .set({
        isValid: false,
        revokedAt: new Date(),
        revokedReason: reason,
        revokedByIp: ipAddress,
      })
      .where(eq(userLogins.refreshToken, refreshToken))
      .returning();

    return revokedLogin;
  }

  static async revokeAllUserLogins(
    userId: number,
    reason: string,
    ipAddress: string
  ) {
    return db
      .update(userLogins)
      .set({
        isValid: false,
        revokedAt: new Date(),
        revokedReason: reason,
        revokedByIp: ipAddress,
      })
      .where(and(eq(userLogins.userId, userId), eq(userLogins.isValid, true)));
  }

  static async getUserLogins(userId: number) {
    return db
      .select()
      .from(userLogins)
      .where(eq(userLogins.userId, userId))
      .orderBy(desc(userLogins.issuedAt));
  }

  static async getActiveUserLogins(userId: number) {
    return db
      .select()
      .from(userLogins)
      .where(
        and(
          eq(userLogins.userId, userId),
          eq(userLogins.isValid, true),
          gte(userLogins.expiresAt, new Date())
        )
      )
      .orderBy(desc(userLogins.issuedAt));
  }
}
