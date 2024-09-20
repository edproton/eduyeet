import { VerificationRepository, VerificationData } from '@/repositories/verification.repository'
import { User, UsersRepository } from '@/repositories/users.repository'
import { logger } from '@/lib/logger'
import { emailService } from './email/service'

export const VerificationService = {
	async createVerification(userId: number): Promise<VerificationData> {
		const user = await this._getAndVerify(userId)
		const verification = await this._sendVerificationEmail(user)

		logger.info(`Verification email sent to: ${user.email}`)

		return verification
	},

	async verifyUser(userId: number, verificationCode: string): Promise<void> {
		logger.info('Attempting to verify user', { userId })

		await this._getAndVerify(userId)

		const verification = await VerificationRepository.getVerification(userId)

		if (!verification) {
			throw new Error('Verification not found')
		}

		if (verification.verificationCode !== verificationCode) {
			throw new Error('Invalid verification code')
		}

		if (verification.verificationExpires < new Date()) {
			throw new Error('Verification expired')
		}

		await VerificationRepository.clearVerification(userId)
		await UsersRepository.updateIsVerified(userId, true)

		logger.info('User verified successfully', { userId })
	},

	async resendVerification(userId: number): Promise<VerificationData> {
		const user = await this._getAndVerify(userId)

		await VerificationRepository.clearVerification(userId)
		const verification = await this._sendVerificationEmail(user)

		logger.info(`Verification email resent to: ${user.email}`)

		return verification
	},

	async getVerification(userId: number): Promise<VerificationData | null> {
		return VerificationRepository.getVerification(userId)
	},

	async clearVerification(userId: number): Promise<void> {
		await VerificationRepository.clearVerification(userId)
		logger.info(`Verification cleared for user: ${userId}`)
	},

	async _getAndVerify(userId: number): Promise<User> {
		const user = await UsersRepository.getById(userId)
		if (!user) {
			throw new Error('User not found')
		}

		if (user.isVerified) {
			throw new Error('User is already verified')
		}

		return user
	},

	async _sendVerificationEmail(user: {
		id: number
		name: string
		email: string
		password: string
		type: 'tutor' | 'student'
		isVerified: boolean
		createdAt: Date
		updatedAt: Date | null
	}) {
		const verification = await VerificationRepository.createVerification(user.id)

		const verificationLink = `${process.env.APP_URL}/auth/verify?id=${user.id}&code=${verification.verificationCode}`

		await emailService.sendEmail({
			to: user.email,
			subject: 'Verify your Eduyeet account',
			body: `
			<h1>Welcome to Eduyeet!</h1>
			<p>Please click the link below to verify your account:</p>
			<a href="${verificationLink}">Verify Account</a>
			<p>This link will expire in 24 hours.</p>`
		})

		return verification
	}
}
