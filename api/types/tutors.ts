import { DayOfWeek } from './common'

export interface AvailabilityDto {
	day: DayOfWeek
	timeSlots: TimeSlotDto[]
}

export interface TimeSlotDto {
	startTime: string // Using string for TimeSpan, format: "HH:mm:ss"
	endTime: string
}
