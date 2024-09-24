import axios, { AxiosError } from 'axios'

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

export const api = {
	getLearningSystems: async (): Promise<LearningSystem[]> =>
		axios
			.get(`${API_URL}/learning-systems`, {
				params: { skip: 0, take: 100 }
			})
			.then((res) => res.data.items)
			.catch(handleApiError),

	createLearningSystem: async (name: string): Promise<LearningSystem> =>
		axios
			.post(`${API_URL}/learning-systems`, { name })
			.then((res) => res.data)
			.catch(handleApiError),

	updateLearningSystem: async (id: string, name: string): Promise<LearningSystem> =>
		axios
			.put(`${API_URL}/learning-systems/${id}`, { name, id })
			.then((res) => res.data)
			.catch(handleApiError),

	deleteLearningSystem: async (id: string): Promise<void> =>
		axios
			.delete(`${API_URL}/learning-systems/${id}`)
			.then(() => {}) // Return void
			.catch(handleApiError),

	addSubject: async (systemId: string, name: string): Promise<Subject> =>
		axios
			.post(`${API_URL}/learning-systems/${systemId}/subjects`, {
				name,
				learningSystemId: systemId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	updateSubject: async (systemId: string, subjectId: string, name: string): Promise<Subject> =>
		axios
			.put(`${API_URL}/learning-systems/${systemId}/subjects/${subjectId}`, {
				name,
				id: subjectId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	removeSubject: async (systemId: string, subjectId: string): Promise<void> =>
		axios
			.delete(`${API_URL}/learning-systems/${systemId}/subjects/${subjectId}`)
			.then(() => {}) // Return void
			.catch(handleApiError),

	addQualification: async (subjectId: string, name: string): Promise<Qualification> =>
		axios
			.post(`${API_URL}/subjects/${subjectId}/qualifications`, { name, subjectId })
			.then((res) => res.data)
			.catch(handleApiError),

	updateQualification: async (
		subjectId: string,
		qualificationId: string,
		name: string
	): Promise<Qualification> =>
		axios
			.put(`${API_URL}/subjects/${subjectId}/qualifications/${qualificationId}`, {
				name,
				id: qualificationId
			})
			.then((res) => res.data)
			.catch(handleApiError),

	removeQualification: async (subjectId: string, qualificationId: string): Promise<void> =>
		axios
			.delete(`${API_URL}/subjects/${subjectId}/qualifications/${qualificationId}`)
			.then(() => {}) // Return void
			.catch(handleApiError)
}
