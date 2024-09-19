import { logger } from '@/lib/logger'
import { User, UserInsert, UsersRepository } from '@/repositories'

export const authService = {
	async verifyUser(id: number, verifyCode: string): Promise<User> {
		const existingUser = await UsersRepository.getById(id)
		if (!existingUser) {
			throw new Error('User not found')
		}

		const updatedUser = await UsersRepository.updateIsVerified(id, true)

		logger.info(`User ${existingUser.email} has been verified`)

		return updatedUser
	},

	async registerUser(user: UserInsert) {
		const existByEmail = await UsersRepository.getByEmail(user.email)
		if (existByEmail) {
			logger.info(`Attempted registering an already register email ${user.email}`)
			throw new Error('Email already register')
		}

		const newUser = await UsersRepository.insert(user)

		await emailService.sendEmail({
			to: newUser.email,
			subject: 'Verify you Eduyeet account',
			body: ``
		})
	}
}

interface Email {
	to: string
	subject: string
	body: string
}

export const emailService = {
	async sendEmail(email: Email) {}
}
