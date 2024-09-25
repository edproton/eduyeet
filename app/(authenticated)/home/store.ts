import Cookies from 'js-cookie'
import { create } from 'zustand'

export interface DecodedToken {
	aud: string
	exp: number
	name: string
	personId: string
	type: 'tutor' | 'student'
	nameIdentifier: string
	qualifications: string[]
	iss: string
	jti: string
}

export interface JwtState {
	decodedToken: DecodedToken | null
	setDecodedToken: (token: DecodedToken | null) => void
	decodeTokenFromCookie: () => void
}

export const useJwtStore = create<JwtState>((set) => ({
	decodedToken: null,
	setDecodedToken: (token) => set({ decodedToken: token }),
	decodeTokenFromCookie: () => {
		const accessToken = Cookies.get('accessToken')
		if (accessToken) {
			try {
				const decoded = jwtDecode(accessToken)
				set({ decodedToken: decoded })
			} catch (error) {
				console.error('Error decoding JWT:', error)
				set({ decodedToken: null })
			}
		} else {
			set({ decodedToken: null })
		}
	}
}))

function jwtDecode(accessToken: string): DecodedToken {
	const base64Url = accessToken.split('.')[1]
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split('')
			.map(function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
			})
			.join('')
	)

	const decoded = JSON.parse(jsonPayload)

	return {
		aud: decoded.aud,
		exp: decoded.exp,
		name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
		nameIdentifier: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
		iss: decoded.iss,
		jti: decoded.jti,
		...decoded // Include any additional claims
	}
}
