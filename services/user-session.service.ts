import { logger } from '@/lib/logger'
import { UserLogin, UserLoginsRepository, UserLoginUpdate } from '@/repositories'

const REFRESH_TOKEN_EXPIRE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export class UserSessionService {
	static async createSession(
		userId: number,
		ipAddress: string,
		userAgent: string
	): Promise<UserLogin> {
		return UserLoginsRepository.insert({
			userId: userId,
			ipAddress: ipAddress,
			userAgent: userAgent,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRE)
		})
	}

	static async updateSession(data: UserLoginUpdate): Promise<void> {
		await UserLoginsRepository.update(data)
		logger.info('User login updated', { ...data })
	}

	static async getValidSession(id: string): Promise<UserLogin | null> {
		logger.info('Validating user login', { id })

		const existingUserLogin = await UserLoginsRepository.getById(id)

		if (
			existingUserLogin.revokedAt ||
			existingUserLogin.revokedBy ||
			existingUserLogin.revokedReason ||
			existingUserLogin.revokedByIp
		) {
			logger.warn('User login is revoked', {
				id,
				reason: existingUserLogin.revokedReason,
				revokedBy: existingUserLogin.revokedBy
			})
			return null
		}

		return existingUserLogin
	}

	static async revokeSession(
		id: string,
		revokedBy: string | null,
		ipAddress: string,
		reason: string
	): Promise<void> {
		await this.updateSession({
			id,
			revokedAt: new Date(),
			revokedBy,
			revokedByIp: ipAddress,
			revokedReason: reason
		})
	}
}
