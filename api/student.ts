import { API_URL, authAxios, handleApiError } from './axios-config'
import { GetStudentWithQualificationsResponse, SetStudentQualificationsCommand } from '@/api/types'


export const studentApi = {
	setStudentQualifications: async (personId: string, data: SetStudentQualificationsCommand): Promise<void> =>
		authAxios
			.post(`${API_URL}/students/${personId}/qualifications`, data)
			.then(() => {})
			.catch(handleApiError),

	getStudentWithQualifications: async (studentId: string): Promise<GetStudentWithQualificationsResponse> =>
		authAxios
			.get(`${API_URL}/students/${studentId}`)
			.then((res) => res.data)
			.catch(handleApiError),
}