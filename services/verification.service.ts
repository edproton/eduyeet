import { VerificationRepository, VerificationData } from '@/repositories/verification.repository'
import { UsersRepository } from '@/repositories/users.repository'
import { logger } from '@/lib/logger'
import { emailService } from './email/service'

export const VerificationService = {
	async createVerification(userId: number): Promise<VerificationData> {
		const user = await UsersRepository.getById(userId)
		if (!user) {
			throw new Error('User not found')
		}

		if (user.isVerified) {
			throw new Error('User is already verified')
		}

		const verification = await VerificationRepository.createVerification(userId)

		const verificationLink = `${process.env.APP_URL}/auth/verify?id=${userId}&code=${verification.verificationCode}`

		await emailService.sendEmail({
			to: user.email,
			subject: 'Verify your Eduyeet account',
			body: `
        <h1>Welcome to Eduyeet!</h1>
        <p>Please click the link below to verify your account:</p>
        <a href="${verificationLink}">Verify Account</a>
        <p>This link will expire in 24 hours.</p>
      `
		})

		logger.info(`Verification email sent to: ${user.email}`)

		return verification
	},

	async verifyUser(userId: number, verificationCode: string): Promise<boolean> {
		const verification = await VerificationRepository.getVerification(userId)
		if (!verification) {
			throw new Error('No verification found for this user')
		}

		if (verification.verificationCode !== verificationCode) {
			throw new Error('Invalid verification code')
		}

		if (new Date() > verification.verificationExpires) {
			throw new Error('Verification code has expired')
		}

		const verified = await VerificationRepository.verifyUser(userId, verificationCode)
		if (verified) {
			logger.info(`User ${userId} has been verified`)
		}

		return verified
	},

	async resendVerification(userId: number): Promise<VerificationData> {
		const user = await UsersRepository.getById(userId)
		if (!user) {
			throw new Error('User not found')
		}

		if (user.isVerified) {
			throw new Error('User is already verified')
		}

		await VerificationRepository.clearVerification(userId)
		const verification = await this.createVerification(userId)

		logger.info(`Verification email resent to: ${user.email}`)

		return verification
	},

	async getVerification(userId: number): Promise<VerificationData | null> {
		return VerificationRepository.getVerification(userId)
	},

	async clearVerification(userId: number): Promise<void> {
		await VerificationRepository.clearVerification(userId)
		logger.info(`Verification cleared for user: ${userId}`)
	}
}
