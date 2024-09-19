import { AuthService } from '@/services/auth.service'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
	const headersList = headers()

	const authorizationHeader = headersList.get('Authorization')
	if (!authorizationHeader) {
		return NextResponse.json({ error: 'No authorization header provided' }, { status: 401 })
	}

	const accessToken = authorizationHeader.replace('Bearer ', '')
	if (!accessToken) {
		return NextResponse.json({ error: 'No access token provided' }, { status: 401 })
	}

	try {
		const payload = await AuthService.validateToken(accessToken)
		const isRefreshTokenValid = await AuthService.getValidatedUserLogin(payload.jti!)

		if (!isRefreshTokenValid) {
			return NextResponse.json({ valid: false, reason: 'Token revoked' }, { status: 200 })
		}

		return NextResponse.json({ valid: true }, { status: 200 })
	} catch (error) {
		console.error('Error validating token:', error)
		return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
	}
}
