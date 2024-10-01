import { PersonType } from './common'

export interface RegisterData {
	name: string
	email: string
	password: string
	type: number
	countryCode: string
}

export interface LoginData {
	email: string
	password: string
}

export interface LoginResponse {
	token: string
}

export interface GetMeResponse {
	id: string
	personId: string
	name: string
	email: string
	type: PersonType
	timeZoneId: string
	metadata: {
		isAvailabilityConfigured?: boolean
		isQualificationsConfigured: boolean
	}
}
