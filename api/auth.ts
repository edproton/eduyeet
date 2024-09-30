// api/auth.ts
import { API_URL, authAxios, handleApiError } from './axios-config'
import { RegisterData, LoginData, LoginResponse, GetMeResponse } from './types/auth'
import Cookies from 'js-cookie'

const TOKEN_COOKIE_NAME = 'accessToken'

export const authApi = {
	register: async (data: RegisterData): Promise<void> =>
		authAxios
			.post(`${API_URL}/Auth/register`, data)
			.then(() => {})
			.catch(handleApiError),

	login: async (data: LoginData): Promise<LoginResponse> =>
		authAxios
			.post(`${API_URL}/Auth/login`, data)
			.then((res) => {
				const { token } = res.data
				authApi.setAuthToken(token)
				return res.data
			})
			.catch(handleApiError),

	getMe: async (): Promise<GetMeResponse> =>
		authAxios
			.get(`${API_URL}/auth/me`)
			.then((res) => res.data)
			.catch(handleApiError),

	setAuthToken: (token: string) => {
		Cookies.set(TOKEN_COOKIE_NAME, token, {
			path: '/',
			expires: 7, // Set expiration to 7 days, adjust as needed
			secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
			sameSite: 'strict'
		})
	},

	getAuthToken: (): string | undefined => {
		return Cookies.get(TOKEN_COOKIE_NAME)
	},

	clearAuthToken: () => {
		Cookies.remove(TOKEN_COOKIE_NAME)
	},

	logout: () => {
		authApi.clearAuthToken()
		// You might want to add additional logout logic here,
		// such as clearing other stored data or redirecting the user
	}
}
