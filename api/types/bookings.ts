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
