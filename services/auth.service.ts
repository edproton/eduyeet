import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'
import { UsersRepository, UserType, User, UserInsert } from '@/repositories'
import { JWTService, UserSessionService, VerificationService } from '.'

interface AuthRequest {
	jwtToken: string
	ipAddress: string
	userAgent: string
}

export class AuthError extends Error {
	constructor(
		message: string,
		public context?: Record<string, unknown>
	) {
		super(message)
		this.name = 'AuthError'
	}
}

export class AuthService {
	static async register(
		name: string,
		email: string,
		password: string,
		type: UserType
	): Promise<void> {
		const emailExists = await UsersRepository.getByEmail(email)
		if (emailExists) {
			throw new AuthError('Email already in use', { email })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		await UsersRepository.insert({
			name,
			email,
			type: type,
			password: hashedPassword
		})

		logger.info('User registered successfully', { email, type })
	}

	static async login(
		email: string,
		password: string,
		ipAddress: string,
		userAgent: string
	): Promise<{ accessToken: string }> {
		const user = await UsersRepository.getByEmail(email)
		if (!user || !(await bcrypt.compare(password, user.password))) {
			throw new AuthError('Invalid email or password')
		}

		const loginEntry = await UserSessionService.createSession(user.id, ipAddress, userAgent)

		const accessToken = await JWTService.sign({
			userId: user.id,
			email: user.email,
			type: user.type,
			jti: loginEntry.id.toString()
		})

		logger.info('User logged in successfully', { userId: user.id, ipAddress })
		return { accessToken }
	}

	static async renewToken(request: AuthRequest): Promise<{ accessToken: string }> {
		logger.info('Attempting to renew token', {
			ipAddress: request.ipAddress
		})

		const payload = await JWTService.verify(request.jwtToken)
		const oldUserSession = await UserSessionService.getValidSession(payload.jti as string)
		if (!oldUserSession) {
			throw new AuthError('Token revoked')
		}

		await UserSessionService.revokeSession(
			oldUserSession.id,
			'Token refreshed',
			request.ipAddress,
			'Token refreshed'
		)

		const newLoginEntry = await UserSessionService.createSession(
			oldUserSession.userId,
			request.ipAddress,
			request.userAgent
		)

		const newAccessToken = await JWTService.sign({
			userId: oldUserSession.userId,
			email: payload.email as string,
			type: payload.type as UserType,
			jti: newLoginEntry.id.toString()
		})

		logger.info('Token renewed successfully', {
			userId: oldUserSession.userId
		})
		return { accessToken: newAccessToken }
	}

	static async logout(request: AuthRequest): Promise<void> {
		logger.info('Attempting to log out user', {
			ipAddress: request.ipAddress
		})

		const payload = await JWTService.verify(request.jwtToken)
		const userSession = await UserSessionService.getValidSession(payload.jti as string)

		if (!userSession) {
			throw new AuthError('Invalid token: user session not found')
		}

		await UserSessionService.revokeSession(
			userSession.id,
			null,
			request.ipAddress,
			'User logged out'
		)

		logger.info('User logged out successfully', {
			userId: userSession.userId
		})
	}

	static async verifyUser(id: number, verifyCode: string): Promise<User> {
		logger.info('Attempting to verify user', { userId: id })

		const verified = await VerificationService.verifyUser(id, verifyCode)
		if (!verified) {
			throw new AuthError('Failed to verify user', { userId: id })
		}

		const updatedUser = await UsersRepository.getById(id)
		if (!updatedUser) {
			throw new AuthError('User not found after verification', { userId: id })
		}

		logger.info('User verified successfully', { userId: id })
		return updatedUser
	}

	static async registerUser(user: UserInsert): Promise<User> {
		logger.info('Attempting to register new user', { email: user.email })

		const existByEmail = await UsersRepository.getByEmail(user.email)
		if (existByEmail) {
			throw new AuthError('Email already registered', { email: user.email })
		}

		const newUser = await UsersRepository.insert(user)
		await VerificationService.createVerification(newUser.id)

		logger.info('User registered successfully', { userId: newUser.id, email: newUser.email })
		return newUser
	}

	static async resendVerificationEmail(userId: number): Promise<void> {
		logger.info('Attempting to resend verification email', { userId })

		await VerificationService.resendVerification(userId)

		logger.info('Verification email resent successfully', { userId })
	}
}
