'use server'

import { z } from 'zod'
import { AuthService, AuthError } from '@/services/auth-service'
import { logger } from '@/lib/logger'
import {
	getRequestInfo,
	setAccessTokenCookie,
	removeAccessTokenCookie
} from '@/lib/nextjs/auth_helpers'

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	remember: z.boolean().optional()
})

const registerSchema = z.object({
	name: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(8),
	type: z.enum(['student', 'tutor']),
	agreeToTerms: z.boolean().refine((val) => val === true, {
		message: 'You must agree to the EduYeet guidelines.'
	})
})

export type ActionResult = {
	error?: string
	success?: string
} | null

function handleActionError(error: unknown, defaultMessage: string): ActionResult {
	if (error instanceof AuthError) {
		logger.error(error.message, error.context)
		return { error: error.message }
	} else if (error instanceof Error) {
		logger.error(error.message, { errorType: error.name })
		return { error: defaultMessage }
	} else {
		logger.error('Unknown error occurred', { unknownError: error })
		return { error: defaultMessage }
	}
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
	const validatedFields = loginSchema.safeParse({
		email: formData.get('email'),
		password: formData.get('password'),
		remember: formData.get('remember') === 'true'
	})

	if (!validatedFields.success) {
		logger.warn('Login validation failed', {
			errors: validatedFields.error.errors
		})
		return { error: 'Invalid email or password' }
	}

	const { email, password, remember } = validatedFields.data

	try {
		const { ipAddress, userAgent } = getRequestInfo()

		logger.info('Attempting login', { email, ipAddress })

		const { accessToken } = await AuthService.login(email, password, ipAddress, userAgent)

		setAccessTokenCookie(accessToken, remember || false)

		logger.info('Login successful', { email })
		return { success: 'Welcome back!' }
	} catch (error) {
		return handleActionError(error, 'Invalid email or password')
	}
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
	const validatedFields = registerSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
		type: formData.get('type'),
		agreeToTerms: formData.get('agreeToTerms') === 'true'
	})

	if (!validatedFields.success) {
		logger.warn('Registration validation failed', {
			errors: validatedFields.error.errors
		})
		return { error: 'Invalid fields' }
	}

	const { name, email, password, type } = validatedFields.data

	try {
		logger.info('Attempting registration', { email, type })
		await AuthService.register(name, email, password, type)
		logger.info('Registration successful', { email, type })
		return { success: 'Registered successfully' }
	} catch (error) {
		return handleActionError(error, 'An error occurred during registration')
	}
}

export async function logoutAction(): Promise<ActionResult> {
	try {
		const { ipAddress, userAgent, accessToken } = getRequestInfo()

		if (!accessToken) {
			logger.warn('Logout attempted without access token')
			return { error: 'No active session' }
		}

		await AuthService.logout({ jwtToken: accessToken, ipAddress, userAgent })

		removeAccessTokenCookie()

		logger.info('Logout successful')
		return { success: 'Logged out successfully' }
	} catch (error) {
		return handleActionError(error, 'An error occurred during logout')
	}
}
