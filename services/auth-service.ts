import { UserLoginRepository } from "@/data/repositories/user-sessions.repository";
import { UserRepository } from "@/data/repositories/user.repository";
import bcrypt from "bcrypt";

interface LoginResult {
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Authenticates a user and generates access and refresh tokens.
   * @param email - The user's email.
   * @param password - The user's password.
   * @param ipAddress - The IP address of the login request.
   * @param userAgent - The user agent of the login request.
   * @param deviceInfo - Information about the device used for login.
   * @returns An object containing user information and tokens.
   * @throws Error if authentication fails.
   */
  static async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: any
  ): Promise<LoginResult> {
    // Validate user
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const { refreshToken, accessToken } =
      await UserLoginRepository.createUserLogin({
        userId: user.id,
        ipAddress,
        userAgent,
        deviceInfo,
      });

    // Return user info and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logs out a user by revoking their refresh token.
   * @param refreshToken - The refresh token to revoke.
   * @param ipAddress - The IP address of the logout request.
   */
  static async logout(refreshToken: string, ipAddress: string): Promise<void> {
    await UserLoginRepository.revokeUserLogin(
      refreshToken,
      "User logout",
      ipAddress
    );
  }

  /**
   * Refreshes the access token using a valid refresh token.
   * @param refreshToken - The current refresh token.
   * @param ipAddress - The IP address of the refresh request.
   * @param userAgent - The user agent of the refresh request.
   * @param deviceInfo - Information about the device used for the refresh request.
   * @returns An object containing the new access token and refresh token.
   * @throws Error if the refresh token is invalid.
   */
  static async refreshToken(
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
    deviceInfo: any
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken: newRefreshToken, accessToken } =
      await UserLoginRepository.renew(
        refreshToken,
        ipAddress,
        userAgent,
        deviceInfo
      );

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Changes a user's password.
   * @param userId - The ID of the user.
   * @param currentPassword - The user's current password.
   * @param newPassword - The new password to set.
   * @throws Error if the current password is invalid.
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await UserRepository.updateUser(userId, { password: hashedNewPassword });
  }

  /**
   * Requests a password reset for a user.
   * @param email - The email of the user requesting a password reset.
   * @returns A boolean indicating whether the reset was requested successfully.
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    const user = await UserRepository.getUserByEmail(email);
    if (!user) {
      // Return true even if user doesn't exist to prevent email enumeration
      return true;
    }

    // TODO: Generate a password reset token and send an email to the user
    // This part would typically involve creating a password reset token,
    // saving it to the database with an expiration time, and sending an
    // email to the user with a link to reset their password.

    return true;
  }

  /**
   * Resets a user's password using a reset token.
   * @param resetToken - The password reset token.
   * @param newPassword - The new password to set.
   * @returns A boolean indicating whether the password was reset successfully.
   */
  static async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<boolean> {
    // TODO: Validate the reset token, find the associated user, and reset their password
    // This would involve checking if the token exists and hasn't expired,
    // finding the user associated with the token, and then updating their password.

    // For now, we'll just return true
    return true;
  }
}
