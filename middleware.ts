import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	const accessToken = request.cookies.get('accessToken')?.value
	const { pathname } = request.nextUrl

	// Allow access to the home page regardless of authentication status
	if (pathname === '/') {
		return NextResponse.next()
	}

	// If user is not logged in and trying to access a protected route
	if (!accessToken && pathname !== '/auth') {
		return NextResponse.redirect(new URL('/auth', request.url))
	}

	// If user is logged in and trying to access the auth page
	if (accessToken && pathname === '/auth') {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)'
	]
}
