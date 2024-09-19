import { NextRequest, NextResponse } from 'next/server'
import { removeQuotes } from '@/lib/string_utils'

export class AuthMiddleware {
	private request: NextRequest
	private loginUrl: URL
	private homeUrl: URL
	private refreshUrl: URL
	private validateUrl: URL
	private isAuthPage: boolean
	private isVerifyPage: boolean
	private accessToken: string | undefined

	constructor(request: NextRequest) {
		this.request = request
		this.loginUrl = new URL('/auth', request.url)
		this.homeUrl = new URL('/home', request.url)
		this.refreshUrl = new URL('/api/auth/refresh', request.url)
		this.validateUrl = new URL('/api/auth/validate', request.url)
		this.isAuthPage = request.nextUrl.pathname === '/auth'
		this.isVerifyPage = request.nextUrl.pathname.includes('/auth/verify')
		this.accessToken = request.cookies.get('accessToken')?.value
	}

	async handle(): Promise<NextResponse> {
		if (!this.accessToken) {
			return this.handleNoToken()
		}

		try {
			const { valid } = await this.validateToken(this.accessToken)
			if (valid) {
				return this.handleValidToken()
			}

			return this.refreshToken()
		} catch (error) {
			console.error('Token verification failed:', error)
			return this.handleInvalidToken()
		}
	}

	private handleNoToken(): NextResponse {
		if (this.isVerifyPage) {
			return NextResponse.next()
		}

		if (!this.isAuthPage) {
			this.loginUrl.searchParams.set('redirect', this.request.url)
			return NextResponse.redirect(this.loginUrl)
		}

		return NextResponse.next()
	}

	private async handleValidToken(): Promise<NextResponse> {
		return this.isAuthPage ? NextResponse.redirect(this.homeUrl) : NextResponse.next()
	}

	private async refreshToken(): Promise<NextResponse> {
		const refreshResponse = await fetch(this.refreshUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				'User-Agent': this.request.headers.get('User-Agent') || null!
			}
		})

		if (refreshResponse.ok) {
			const newAccessToken = removeQuotes(await refreshResponse.text())
			const response = this.isAuthPage ? NextResponse.redirect(this.homeUrl) : NextResponse.next()

			response.cookies.set('accessToken', newAccessToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 24 * 60 * 60, // 24 hours
				path: '/'
			})

			return response
		} else {
			return this.handleInvalidToken()
		}
	}

	private async validateToken(jwtToken: string): Promise<{ valid: boolean; reason: string }> {
		const response = await fetch(this.validateUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${jwtToken}`
			}
		})

		return response.json()
	}

	private handleInvalidToken(): NextResponse {
		if (this.isVerifyPage) {
			return NextResponse.next()
		}

		if (!this.isAuthPage) {
			this.loginUrl.searchParams.set('redirect', this.request.url)
			return NextResponse.redirect(this.loginUrl)
		}

		return NextResponse.next()
	}
}
