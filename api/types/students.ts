import { Qualification } from './learning-systems'

export interface GetStudentWithQualificationsResponse {
	id: string
	name: string
	qualifications: Qualification[]
}
