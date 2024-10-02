import { API_URL, authAxios, handleApiError } from './axios-config'
import {
	CreateBookingCommand,
	CreateBookingResponse,
	FindTutorAvailabilityParams,
	FindAvailableTutorsResponse,
	GetAllTutorsByQualificationIdRequest,
	GetAllTutorsByQualificationIdResponse
} from '@/api/types'

export const bookingApi = {
	createBooking: async (data: CreateBookingCommand): Promise<CreateBookingResponse> =>
		authAxios
			.post(`${API_URL}/bookings`, data)
			.then((res) => res.data)
			.catch(handleApiError),

	findTutorAvailability: async (
		params: FindTutorAvailabilityParams
	): Promise<FindAvailableTutorsResponse> =>
		authAxios
			.get(`${API_URL}/bookings/find-tutor-availability`, { params })
			.then((res) => res.data)
			.catch(handleApiError),

	getAllTutorsByQualificationId: async (
		params: GetAllTutorsByQualificationIdRequest
	): Promise<GetAllTutorsByQualificationIdResponse> =>
		authAxios
			.get(`${API_URL}/bookings/available-tutors-by-qualification`, { params })
			.then((res) => res.data)
			.catch(handleApiError),

	getStudentBookings: async (studentId: string): Promise<CreateBookingResponse[]> =>
		authAxios
			.get(`${API_URL}/bookings/student/${studentId}`)
			.then((res) => res.data)
			.catch(handleApiError),

	getTutorBookings: async (tutorId: string): Promise<CreateBookingResponse[]> =>
		authAxios
			.get(`${API_URL}/bookings/tutor/${tutorId}`)
			.then((res) => res.data)
			.catch(handleApiError)
}
