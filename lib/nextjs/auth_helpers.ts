import { cookies, headers } from 'next/headers'
import { logger } from '@/lib/logger'

interface RequestInfo {
	ipAddress: string
	userAgent: string
	accessToken?: string
}

export function getRequestInfo(): RequestInfo {
	const headersList = headers()
	const cookieStore = cookies()

	const userAgent = headersList.get('user-agent') || 'Unknown'
	const forwardedFor = headersList.get('x-forwarded-for')
	const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'
	const accessToken = cookieStore.get('accessToken')?.value

	logger.info('Request info retrieved', {
		ipAddress,
		userAgent: userAgent.substring(0, 50)
	})

	return { ipAddress, userAgent, accessToken }
}

export function setAccessTokenCookie(accessToken: string, remember: boolean): void {
	const cookieStore = cookies()
	cookieStore.set('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: remember ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days if remember, else 24 hours
		path: '/'
	})

	logger.info('Access token cookie set', { remember })
}

export function removeAccessTokenCookie(): void {
	const cookieStore = cookies()
	cookieStore.delete('accessToken')

	logger.info('Access token cookie removed')
}
