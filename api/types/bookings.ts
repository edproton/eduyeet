import { DayOfWeek } from '@/app/api'

export interface CreateBookingCommand {
	studentId: string
	tutorId: string
	qualificationId: string
	startTime: string
}

export interface CreateBookingResponse {
	id: string
	studentId: string
	tutorId: string
	qualificationId: string
	startTime: string
	endTime: string
}

export interface FindTutorAvailabilityParams {
	tutorId: string
	day: number
	month: number
	year: number
	timeZoneId: string
}

export interface FindAvailableTutorsResponse {
	tutor: Tutor
	availability: AvailabilityDto
}

export interface Tutor {
	id: string
	name: string
	countryCode?: number
}

export interface AvailabilityDto {
	weekDay: DayOfWeek
	timeslots: TimeSlot[]
}

export interface TimeSlot {
	startTime: string
	endTime: string
}

export interface GetAllTutorsByQualificationIdRequest {
	qualificationId: string
}

export interface GetAllTutorsByQualificationIdResponse {
	tutors: Tutor[]
}
