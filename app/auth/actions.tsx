'use server'

import { z } from 'zod'
import { AuthService, AuthError } from '@/services/auth.service'
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
		return { error: error.message }
	} else if (error instanceof Error) {
		return { error: defaultMessage }
	} else {
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
		return { error: 'Invalid email or password' }
	}

	const { email, password, remember } = validatedFields.data

	try {
		const { ipAddress, userAgent } = getRequestInfo()
		const { accessToken } = await AuthService.login(email, password, ipAddress, userAgent)
		setAccessTokenCookie(accessToken, remember || false)
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
		return { error: 'Invalid fields' }
	}

	try {
		await AuthService.registerUser(validatedFields.data)
		return { success: 'Registered successfully' }
	} catch (error) {
		return handleActionError(error, 'An error occurred during registration')
	}
}

export async function logoutAction(): Promise<ActionResult> {
	try {
		const { ipAddress, userAgent, accessToken } = getRequestInfo()

		if (!accessToken) {
			return { error: 'No active session' }
		}

		await AuthService.logout({ jwtToken: accessToken, ipAddress, userAgent })
		removeAccessTokenCookie()
		return { success: 'Logged out successfully' }
	} catch (error) {
		return handleActionError(error, 'An error occurred during logout')
	}
}
