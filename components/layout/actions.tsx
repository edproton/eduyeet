'use server'

import { AuthService } from '@/services/auth-service'
import { cookies, headers } from 'next/headers'

export async function logout() {
	const headersList = headers()
	const userAgent = headersList.get('user-agent') || ''
	const ipAddress =
		headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1'
	const accessToken = cookies().get('accessToken')?.value

	if (accessToken) {
		try {
			await AuthService.logout({
				ipAddress,
				userAgent,
				jwtToken: accessToken
			})

			cookies().delete('accessToken')

			return { success: true }
		} catch (error) {
			console.error('Logout failed:', error)
			return { error: 'Failed to logout. Please try again.' }
		}
	} else {
		return { error: 'No active session found.' }
	}
}
