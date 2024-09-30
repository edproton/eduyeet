// api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

export interface LearningSystem {
	id: string
	name: string
	subjects: Subject[]
}

export interface Subject {
	id: string
	name: string
	qualifications: Qualification[]
}

export interface Qualification {
	id: string
	name: string
}

export interface RegisterData {
	name: string
	email: string
	password: string
	type: number
}

interface LoginData {
	email: string
	password: string
}

interface LoginResponse {
	token: string
}

export enum PersonType {
	Tutor = 0,
	Student = 1
}

export interface GetMeResponse {
	id: string
	personId: string
	name: string
	email: string
	type: PersonType
	metadata: {
		isAvailabilityConfigured?: boolean
		isQualificationsConfigured: boolean
	}
}

export interface AvailabilityDto {
	day: DayOfWeek
	timeSlots: TimeSlotDto[]
}

export interface TimeSlotDto {
	startTime: string // Using string for TimeSpan, format: "HH:mm:ss"
	endTime: string
}

// Enum for DayOfWeek (TypeScript doesn't have a built-in DayOfWeek enum)
export enum DayOfWeek {
	Sunday = 0,
	Monday = 1,
	Tuesday = 2,
	Wednesday = 3,
	Thursday = 4,
	Friday = 5,
	Saturday = 6
}

export interface CreateBookingResponse {
	id: string
	studentId: string
	tutorId: string
	qualificationId: string
	startTime: string
	endTime: string
}

export interface CreateBookingCommand {
	studentId: string
	tutorId: string
	qualificationId: string
	startTime: string
}

interface ApiError {
	errors: Array<{
		code: string
		description: string
	}>
}

export class ApiException extends Error {
	code: string

	constructor(code: string, message: string) {
		super(message)
		this.code = code
		this.name = 'ApiException'
	}
}

const handleApiError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError<ApiError>
		if (axiosError.response) {
			if (axiosError.response.status >= 300) {
				if (axiosError.response.data.errors) {
					const apiError = axiosError.response.data.errors[0]
					throw new ApiException(apiError.code, apiError.description)
				}
				throw new ApiException('Frontend error', 'An unknown error occurred')
			}
		}
	}

	throw error
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

const authAxios = axios.create()
authAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = api.getAuthToken()

	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`
	}

	return config
})

export interface GetStudentWithQualificationsResponse {
	id: string
	name: string
	qualifications: Qualification[]
}

export interface FindAvailableTutorsParams {
	qualificationId: string
	requestedDateTime: string
}

export interface AvailableTutorDto {
	id: string
	name: string
}

export interface FindAvailableTutorsResponse {
	qualificationId: string
	qualificationName: string
	requestedDateTime: string
	availableTutors: AvailableTutorDto[]
}

export const api = {
	findAvailableTutors: async (
		params: FindAvailableTutorsParams
	): Promise<FindAvailableTutorsResponse> =>
		authAxios
			.get(`${API_URL}/bookings/available-tutors`, { params })
			.then((res) => res.data)
			.catch(handleApiError),

	createBooking: async (data: CreateBookingCommand): Promise<CreateBookingResponse> =>
		authAxios
			.post(`${API_URL}/bookings`, data)
			.then((res) => res.data)
			.catch(handleApiError),

	getStudentBookings: async (studentId: string): Promise<CreateBookingResponse[]> =>
		authAxios
			.get(`${API_URL}/bookings/students/${studentId}`)
			.then((res) => res.data)
			.catch(handleApiError),

	getTutorBookings: async (tutorId: string): Promise<CreateBookingResponse[]> =>
		authAxios
			.get(`${API_URL}/bookings/tutors/${tutorId}`)
			.then((res) => res.data)
			.catch(handleApiError),

	getStudent: async (studentId: string): Promise<GetStudentWithQualificationsResponse> =>
		authAxios
			.get(`${API_URL}/students/${studentId}`)
			.then((res) => res.data)
			.catch(handleApiError),

	setTutorAvailability: async (
		personId: string,
		availabilities: AvailabilityDto[]
	): Promise<void> =>
		authAxios
			.post(`${API_URL}/tutors/${personId}/availability`, {
				personId,
				availabilities
			})
			.then((res) => res.data)
			.catch(handleApiError),

	setTutorQualifications: async (personId: string, qualificationIds: string[]): Promise<void> =>
		authAxios
			.post(`${API_URL}/tutors/${personId}/qualifications`, {
				personId,
				qualificationIds
			})
			.then((res) => res.data)
			.catch(handleApiError),

	setStudentQualifications: async (personId: string, qualificationIds: string[]): Promise<void> =>
		authAxios
			.post(`${API_URL}/students/${personId}/qualifications`, {
				personId,
				qualificationIds
			})
			.then((res) => res.data)
			.catch(handleApiError),

	getMe: async (): Promise<GetMeResponse> => {
		return authAxios
			.get(`${API_URL}/auth/me`)
			.then((res) => res.data)
			.catch(handleApiError)
	},

	register: async (data: RegisterData): Promise<void> =>
		axios
			.post(`${API_URL}/Auth/register`, data)
			.then(() => {})
			.catch(handleApiError),

	login: async (data: LoginData): Promise<LoginResponse> =>
		axios
			.post(`${API_URL}/Auth/login`, data)
			.then((res) => {
				const { token } = res.data
				api.setAuthToken(token)
				return res.data
			})
			.catch(handleApiError),

	setAuthToken: (token: string) => {
		Cookies.set('accessToken', token, {
			path: '/',
			expires: 7, // Set expiration to 7 days, adjust as needed
			secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
			sameSite: 'strict'
		})
	},

	getAuthToken: (): string | undefined => {
		return Cookies.get('accessToken')
	},

	clearAuthToken: () => {
		Cookies.remove('accessToken')
	},

	getLearningSystems: async (): Promise<LearningSystem[]> =>
		authAxios
			.get(`${API_URL}/learning-systems`, {
				params: { skip: 0, take: 100 }
			})
			.then((res) => res.data.items)
			.catch(handleApiError),

	createLearningSystem: async (name: string): Promise<LearningSystem> =>
		authAxios
			.post(`${API_URL}/learning-systems`, { name })
			.then((res) => res.data)
			.catch(handleApiError),

	updateLearningSystem: async (id: string, name: string): Promise<LearningSystem> =>
		authAxios
			.put(`${API_URL}/learning-systems/${id}`, { name, id })
			.then((res) => res.data)
			.catch(handleApiError),

	deleteLearningSystem: async (id: string): Promise<void> =>
		authAxios
			.delete(`${API_URL}/learning-systems/${id}`)
			.then(() => {})
			.catch(handleApiError),

	addSubject: async (systemId: string, name: string): Promise<Subject> =>
		authAxios
			.post(`${API_URL}/learning-systems/${systemId}/subjects`, {
				name,
				learningSystemId: systemId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	updateSubject: async (systemId: string, subjectId: string, name: string): Promise<Subject> =>
		authAxios
			.put(`${API_URL}/learning-systems/${systemId}/subjects/${subjectId}`, {
				name,
				id: subjectId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	removeSubject: async (systemId: string, subjectId: string): Promise<void> =>
		authAxios
			.delete(`${API_URL}/learning-systems/${systemId}/subjects/${subjectId}`)
			.then(() => {})
			.catch(handleApiError),

	addQualification: async (subjectId: string, name: string): Promise<Qualification> =>
		authAxios
			.post(`${API_URL}/subjects/${subjectId}/qualifications`, { name, subjectId })
			.then((res) => res.data)
			.catch(handleApiError),

	updateQualification: async (
		subjectId: string,
		qualificationId: string,
		name: string
	): Promise<Qualification> =>
		authAxios
			.put(`${API_URL}/subjects/${subjectId}/qualifications/${qualificationId}`, {
				name,
				id: qualificationId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	removeQualification: async (subjectId: string, qualificationId: string): Promise<void> =>
		authAxios
			.delete(`${API_URL}/subjects/${subjectId}/qualifications/${qualificationId}`)
			.then(() => {})
			.catch(handleApiError)
}
