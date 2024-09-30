// api/axios-config.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { authApi } from './auth' // We'll need to be careful about circular dependencies here
import { ApiError, ApiException } from './types/errors'

export const API_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_URL) {
	throw new Error('API_URL is not defined in environment variables')
}

export const authAxios = axios.create({
	baseURL: API_URL
})

authAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = authApi.getAuthToken()

	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`
	}

	return config
})

authAxios.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiError>) => {
		if (error.response?.status === 401) {
			// Handle unauthorized access (e.g., clear token and redirect to login)
			authApi.clearAuthToken()
			// You might want to add logic here to redirect to login page
		}
		return Promise.reject(error)
	}
)

export const handleApiError = (error: unknown): never => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<ApiError>
		if (axiosError.response) {
			if (axiosError.response.status >= 400) {
				if (axiosError.response.data?.errors && axiosError.response.data.errors.length > 0) {
					const apiError = axiosError.response.data.errors[0]
					throw new ApiException(apiError.code, apiError.description)
				}
			}
		}
		throw new ApiException('NETWORK_ERROR', 'A network error occurred')
	}

	if (error instanceof Error) {
		throw new ApiException('UNKNOWN_ERROR', error.message)
	}

	throw new ApiException('UNKNOWN_ERROR', 'An unknown error occurred')
}

export const publicAxios = axios.create({
	baseURL: API_URL
})

// You can add interceptors to publicAxios here if needed
