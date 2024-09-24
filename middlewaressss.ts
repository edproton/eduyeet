import { NextRequest } from 'next/server'
import { AuthMiddleware } from './middlewares'

export default async function middleware(request: NextRequest) {
	const authMiddleware = new AuthMiddleware(request)

	return authMiddleware.handle()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 * - public/layout (layout images)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|public/layout).*)'
	]
}
