import { addMinutes, format, isBefore } from 'date-fns'

export enum DayOfWeek {
	Sunday = 0,
	Monday = 1,
	Tuesday = 2,
	Wednesday = 3,
	Thursday = 4,
	Friday = 5,
	Saturday = 6
}

export const daysOfWeek = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
] as const

export interface TimeSlotDto {
	startTime: string // Using string for TimeSpan, format: "HH:mm:ss"
	endTime: string
}

export interface AvailabilityDto {
	day: DayOfWeek
	timeSlots: TimeSlotDto[]
}

export interface TimeSlot {
	startTime: Date | null
	endTime: Date | null
}

export interface DayAvailability {
	day: (typeof daysOfWeek)[number]
	timeSlots: TimeSlot[]
}

export const generateTimeOptions = (start: Date, end: Date, step: number = 5): string[] => {
	const options: string[] = []
	let current = start
	while (isBefore(current, end)) {
		options.push(format(current, 'HH:mm'))
		current = addMinutes(current, step)
	}
	if (!options.includes(format(end, 'HH:mm'))) {
		options.push(format(end, 'HH:mm'))
	}
	return options
}

export const formatTimeToTimeSpan = (time: Date | null): string => {
	if (!time) return '00:00:00'
	const hours = time.getHours().toString().padStart(2, '0')
	const minutes = time.getMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}:00`
}
