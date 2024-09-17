import { AuthService } from '@/services/auth-service'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const headersList = headers()

	const authorizationHeader = headersList.get('authorization')
	if (!authorizationHeader) {
		return NextResponse.json({ error: 'No authorization header provided' }, { status: 401 })
	}

	const accessToken = authorizationHeader.replace('Bearer ', '')
	if (!accessToken) {
		return NextResponse.json({ error: 'No access token provided' }, { status: 401 })
	}

	try {
		const userAgent = request.headers.get('user-agent') || 'Unknown'
		const forwardedFor = request.headers.get('x-forwarded-for')
		const ipAddress = forwardedFor?.split(',')[0] || request.ip || '127.0.0.1'

		const { accessToken: newAccessToken } = await AuthService.renewToken({
			jwtToken: accessToken,
			userAgent,
			ipAddress
		})

		return NextResponse.json(newAccessToken, { status: 200 })
	} catch (error) {
		console.error('Token renewal failed:', error)
		return NextResponse.json({ error: 'Token renewal failed' }, { status: 401 })
	}
}
