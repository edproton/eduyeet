'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Search, AlertCircle, X } from 'lucide-react'
import { api, GetMeResponse } from '@/app/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { differenceInMinutes, endOfDay } from 'date-fns'
import DayAvailability from './DayAvailability'
import {
	DayAvailability as DayAvailabilityType,
	TimeSlot,
	daysOfWeek,
	formatTimeToTimeSpan,
	AvailabilityDto,
	DayOfWeek
} from './utils'

interface TutorAvailabilityFormProps {
	userData: GetMeResponse
}

const TutorAvailabilityConfigurationForm: React.FC<TutorAvailabilityFormProps> = ({ userData }) => {
	const [availabilities, setAvailabilities] = useState<DayAvailabilityType[]>(
		daysOfWeek.map((day) => ({ day, timeSlots: [] }))
	)
	const [error, setError] = useState<string>('')
	const [searchTerm, setSearchTerm] = useState<string>('')
	const [clipboard, setClipboard] = useState<TimeSlot[] | null>(null)
	const [copiedDay, setCopiedDay] = useState<string | null>(null)
	const router = useRouter()
	const queryClient = useQueryClient()

	const isValidTimeSlot = (slot: TimeSlot): boolean => {
		return slot.startTime !== null && slot.endTime !== null
	}

	const canCopyDay = (dayAvailability: DayAvailabilityType): boolean => {
		return dayAvailability.timeSlots.length > 0 && dayAvailability.timeSlots.every(isValidTimeSlot)
	}

	const deepCopyTimeSlot = (slot: TimeSlot): TimeSlot => {
		return {
			startTime: slot.startTime ? new Date(slot.startTime) : null,
			endTime: slot.endTime ? new Date(slot.endTime) : null
		}
	}

	const copyDay = (dayIndex: number) => {
		const dayToCopy = availabilities[dayIndex]
		if (canCopyDay(dayToCopy)) {
			const copiedTimeSlots = dayToCopy.timeSlots.map(deepCopyTimeSlot)
			setClipboard(copiedTimeSlots)
			setCopiedDay(dayToCopy.day)
			toast({
				title: 'Copied',
				description: `Availability schedule for ${dayToCopy.day} copied to clipboard`
			})
		} else {
			toast({
				title: 'Copy Failed',
				description: 'Ensure all time slots have both start and end times',
				variant: 'destructive'
			})
		}
	}

	const pasteDay = (dayIndex: number) => {
		if (clipboard) {
			setAvailabilities((prevAvailabilities) => {
				return prevAvailabilities.map((dayAvailability, index) => {
					if (index === dayIndex) {
						return {
							...dayAvailability,
							timeSlots: clipboard.map(deepCopyTimeSlot)
						}
					}
					return dayAvailability
				})
			})
			toast({
				title: 'Pasted',
				description: `Availability schedule pasted to ${availabilities[dayIndex].day}`
			})
		}
	}

	const clearClipboard = () => {
		setClipboard(null)
		setCopiedDay(null)
		toast({
			title: 'Cleared',
			description: 'Clipboard has been cleared'
		})
	}

	const updateTimeSlot = (
		dayIndex: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: Date | null
	) => {
		setAvailabilities((prevAvailabilities) => {
			return prevAvailabilities.map((dayAvailability, index) => {
				if (index === dayIndex) {
					const updatedTimeSlots = dayAvailability.timeSlots.map((slot, idx) => {
						if (idx === slotIndex) {
							return { ...slot, [field]: value }
						}
						return slot
					})
					return { ...dayAvailability, timeSlots: updatedTimeSlots }
				}
				return dayAvailability
			})
		})
	}

	const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
		setAvailabilities((prevAvailabilities) =>
			prevAvailabilities.map((dayAvailability, index) => {
				if (index === dayIndex) {
					return {
						...dayAvailability,
						timeSlots: dayAvailability.timeSlots.filter((_, i) => i !== slotIndex)
					}
				}
				return dayAvailability
			})
		)
	}

	const saveMutation = useMutation({
		mutationFn: (formattedAvailabilities: AvailabilityDto[]) =>
			api.setTutorAvailability(userData.personId, formattedAvailabilities),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['getMe']
			})

			toast({
				title: 'Success',
				description: 'Your availability has been saved successfully.'
			})

			router.refresh()
		},
		onError: (error: Error) => {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to save availability: ${error.message}`
			})
		}
	})

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')

		const formattedAvailabilities: AvailabilityDto[] = availabilities
			.filter((availability) => availability.timeSlots.length > 0)
			.map((availability) => ({
				day: daysOfWeek.indexOf(availability.day) as DayOfWeek,
				timeSlots: availability.timeSlots
					.filter((slot) => slot.startTime && slot.endTime)
					.map((slot) => ({
						startTime: formatTimeToTimeSpan(slot.startTime),
						endTime: formatTimeToTimeSpan(slot.endTime)
					}))
			}))

		saveMutation.mutate(formattedAvailabilities)
	}

	const addTimeSlot = (dayIndex: number) => {
		setAvailabilities((prevAvailabilities) => {
			return prevAvailabilities.map((dayAvailability, index) => {
				if (index === dayIndex) {
					return {
						...dayAvailability,
						timeSlots: [
							...dayAvailability.timeSlots,
							{
								startTime: null,
								endTime: null
							}
						]
					}
				}
				return dayAvailability
			})
		})
	}

	const canAddTimeSlot = (dayAvailability: DayAvailabilityType): boolean => {
		if (dayAvailability.timeSlots.length === 0) return true
		const lastSlot = dayAvailability.timeSlots[dayAvailability.timeSlots.length - 1]
		if (!lastSlot.startTime || !lastSlot.endTime) return false

		const endOfDayTime = endOfDay(new Date())
		let lastSlotEnd = lastSlot.endTime
		if (lastSlotEnd.getHours() === 0 && lastSlotEnd.getMinutes() === 0) {
			lastSlotEnd = endOfDayTime
		}

		if (lastSlotEnd.getHours() === 23 && lastSlotEnd.getMinutes() === 59) {
			return false
		}

		const remainingMinutes = differenceInMinutes(endOfDayTime, lastSlotEnd)
		return remainingMinutes >= 60
	}

	const filteredAvailabilities = availabilities.filter((availability) =>
		availability.day.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-foreground">
				Set Your Teaching Availability
			</h2>
			{clipboard && copiedDay && (
				<Alert className="relative mb-6">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle className="text-lg font-semibold mb-2">Clipboard Content</AlertTitle>
					<AlertDescription className="text-sm">
						Availability schedule for {copiedDay} ({clipboard.length} time slot
						{clipboard.length !== 1 ? 's' : ''}) is ready to paste. Use the &quot;Paste&quot; button
						on any day to apply this schedule.
					</AlertDescription>

					<div>
						<Button
							type="button"
							onClick={clearClipboard}
							variant="default"
							size="sm"
							className="absolute top-2 right-2"
						>
							<X size={16} /> Clear
						</Button>
					</div>
				</Alert>
			)}
			<div className="mb-4">
				<div className="relative">
					<Input
						type="text"
						placeholder="Search days..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
					<Search
						className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
						size={18}
					/>
				</div>
			</div>
			<div className="grid gap-6 sm:grid-cols-2">
				{filteredAvailabilities.map((availability, dayIndex) => (
					<DayAvailability
						key={dayIndex}
						availability={availability}
						dayIndex={dayIndex}
						updateTimeSlot={updateTimeSlot}
						removeTimeSlot={removeTimeSlot}
						addTimeSlot={addTimeSlot}
						copyDay={copyDay}
						pasteDay={pasteDay}
						canCopyDay={canCopyDay}
						canAddTimeSlot={canAddTimeSlot}
						clipboard={clipboard}
					/>
				))}
			</div>
			{error && (
				<Alert variant="destructive">
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="bg-accent p-4 rounded-lg"
			>
				<p className="text-sm text-accent-foreground">
					<strong>Note:</strong> A lesson consists of 55 minutes of instruction followed by a
					5-minute break. This structure allows for optimal learning and a brief reset between
					sessions.
				</p>
				<p className="text-sm text-accent-foreground mt-2 italic">
					Why &ldquo;up to&rdquo; for lesson count? As a tutor, you&apos;re responsible for managing
					your time effectively. For example, if you&apos;re available from 10:00 to 12:00 and
					accept a booking at 10:30, you&apos;ll only be able to conduct one full session. The
					&#34;up to&#34; phrasing gives you flexibility in scheduling and helps set appropriate
					expectations for potential students.
				</p>
			</motion.div>
			<Button type="submit" className="w-full">
				Set Availability
			</Button>
		</form>
	)
}

export default TutorAvailabilityConfigurationForm
