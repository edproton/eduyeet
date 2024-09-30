'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
	addMinutes,
	differenceInMinutes,
	parse,
	format,
	setHours,
	setMinutes,
	isValid,
	startOfDay,
	endOfDay,
	isBefore
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
	Clock,
	Plus,
	Trash2,
	Search,
	Copy,
	Clipboard,
	AlertCircle,
	X,
	ChevronsUpDown
} from 'lucide-react'
import { api, GetMeResponse } from '@/app/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const daysOfWeek = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday'
] as const
type DayOfWeek = (typeof daysOfWeek)[number]

interface TimeSlot {
	startTime: Date | null
	endTime: Date | null
}

interface DayAvailability {
	day: DayOfWeek
	timeSlots: TimeSlot[]
}

const generateTimeOptions = (start: Date, end: Date, step: number = 5): string[] => {
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

interface TimeSlotProps {
	dayIndex: number
	slotIndex: number
	startTime: Date | null
	endTime: Date | null
	previousEndTime: Date | null
	nextStartTime: Date | null
	isLastSlot: boolean
	updateTimeSlot: (
		dayIndex: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: Date | null
	) => void
	removeTimeSlot: (dayIndex: number, slotIndex: number) => void
}

const TimeSlot: React.FC<TimeSlotProps> = ({
	dayIndex,
	slotIndex,
	startTime,
	endTime,
	previousEndTime,
	nextStartTime,
	updateTimeSlot,
	removeTimeSlot
}) => {
	const [fromOptions, setFromOptions] = useState<Array<{ value: string; label: string }>>([])
	const [toOptions, setToOptions] = useState<Array<{ value: string; label: string }>>([])
	const [openStart, setOpenStart] = useState(false)
	const [openEnd, setOpenEnd] = useState(false)

	useEffect(() => {
		const minStart = previousEndTime || startOfDay(new Date())
		const maxStart = endTime
			? addMinutes(endTime, -60) // At least 1 hour before end time
			: setHours(setMinutes(new Date(), 0), 23)

		setFromOptions(
			generateTimeOptions(minStart, maxStart).map((time) => ({ value: time, label: time }))
		)
	}, [previousEndTime, endTime])

	useEffect(() => {
		if (startTime) {
			const minEnd = addMinutes(startTime, 60)
			const maxEnd = nextStartTime || endOfDay(new Date())
			setToOptions(
				generateTimeOptions(minEnd, maxEnd).map((time) => ({ value: time, label: time }))
			)
		} else {
			setToOptions([])
		}
	}, [startTime, nextStartTime])

	const handleStartTimeChange = useCallback(
		(value: string) => {
			const newStartTime = parse(value, 'HH:mm', new Date())
			if (isValid(newStartTime)) {
				updateTimeSlot(dayIndex, slotIndex, 'startTime', newStartTime)
				if (endTime && isBefore(endTime, addMinutes(newStartTime, 60))) {
					updateTimeSlot(dayIndex, slotIndex, 'endTime', null)
				}
				setOpenStart(false)
			}
		},
		[dayIndex, slotIndex, updateTimeSlot, endTime]
	)

	const handleEndTimeChange = useCallback(
		(value: string) => {
			let newEndTime = parse(value, 'HH:mm', new Date())
			if (isValid(newEndTime)) {
				if (value === '00:00') {
					newEndTime = endOfDay(new Date())
				}
				updateTimeSlot(dayIndex, slotIndex, 'endTime', newEndTime)
				setOpenEnd(false)
			}
		},
		[dayIndex, slotIndex, updateTimeSlot]
	)

	const formatTime = (time: Date | null): string => {
		if (!time) return ''
		if (time.getHours() === 0 && time.getMinutes() === 0) {
			return '00:00'
		}
		return format(time, 'HH:mm')
	}

	const calculateLessons = (): number => {
		if (!startTime || !endTime) return 0
		let endTimeForCalc = endTime
		if (endTime.getHours() === 0 && endTime.getMinutes() === 0) {
			endTimeForCalc = endOfDay(new Date())
		}
		const durationMinutes = differenceInMinutes(endTimeForCalc, startTime)
		return Math.max(1, Math.floor(durationMinutes / 60))
	}

	const lessonCount = calculateLessons()

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
			transition={{ duration: 0.3 }}
			className="flex flex-wrap items-center gap-2 mb-4 bg-secondary p-4 rounded-lg shadow-sm"
		>
			<Clock className="text-muted-foreground mr-2" size={20} />
			<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
				<Popover open={openStart} onOpenChange={setOpenStart}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openStart}
							className="w-full sm:w-[120px] justify-between hover:bg-background"
						>
							{startTime ? formatTime(startTime) : 'From'}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[130px] h-[230px] p-0">
						<Command>
							<CommandInput placeholder="Search time..." />
							<CommandList>
								<CommandEmpty>No time found.</CommandEmpty>
								<CommandGroup>
									{fromOptions.map((option) => (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={handleStartTimeChange}
										>
											{option.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<span className="text-muted-foreground">to</span>
				<Popover open={openEnd} onOpenChange={setOpenEnd}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openEnd}
							className="w-full sm:w-[120px] justify-between hover:bg-background"
							disabled={!startTime}
						>
							{endTime ? formatTime(endTime) : 'To'}
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[130px] h-[230px] p-0">
						<Command>
							<CommandInput placeholder="Search time" />
							<CommandList>
								<CommandEmpty>No time found.</CommandEmpty>
								<CommandGroup>
									{toOptions.map((option) => (
										<CommandItem
											key={option.value}
											value={option.value}
											onSelect={handleEndTimeChange}
										>
											{option.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
			<span className="text-sm text-muted-foreground w-full sm:w-auto sm:ml-2">
				{startTime && endTime ? `(up to ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''})` : ''}
			</span>
			<Button
				type="button"
				onClick={() => removeTimeSlot(dayIndex, slotIndex)}
				variant="destructive"
				size="icon"
				className="ml-auto"
			>
				<Trash2 size={16} />
			</Button>
		</motion.div>
	)
}

interface TutorAvailabilityFormProps {
	userData: GetMeResponse
}

interface FormattedTimeSlot {
	startTime: string
	endTime: string
}

interface FormattedAvailability {
	day: number
	timeSlots: FormattedTimeSlot[]
}

const TutorAvailabilityForm: React.FC<TutorAvailabilityFormProps> = ({ userData }) => {
	const [availabilities, setAvailabilities] = useState<DayAvailability[]>(
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

	const canCopyDay = (dayAvailability: DayAvailability): boolean => {
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
		mutationFn: (formattedAvailabilities: FormattedAvailability[]) =>
			api.setTutorAvailability(userData.personId, formattedAvailabilities),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['user']
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

	const formatTimeToTimeSpan = (time: Date | null): string => {
		if (!time) return '00:00:00'
		const hours = time.getHours().toString().padStart(2, '0')
		const minutes = time.getMinutes().toString().padStart(2, '0')
		return `${hours}:${minutes}:00`
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')

		const formattedAvailabilities: FormattedAvailability[] = availabilities
			.filter((availability) => availability.timeSlots.length > 0)
			.map((availability) => ({
				day: daysOfWeek.indexOf(availability.day),
				timeSlots: availability.timeSlots
					.filter((slot) => slot.startTime && slot.endTime)
					.map((slot) => ({
						startTime: formatTimeToTimeSpan(slot.startTime),
						endTime: formatTimeToTimeSpan(slot.endTime)
					}))
			}))

		saveMutation.mutate(formattedAvailabilities)
	}

	const addTimeSlot = (dayIndex: number, count: number = 1) => {
		setAvailabilities((prevAvailabilities) => {
			return prevAvailabilities.map((dayAvailability, index) => {
				if (index === dayIndex) {
					return {
						...dayAvailability,
						timeSlots: [
							...dayAvailability.timeSlots,
							...Array(count)
								.fill(null)
								.map(() => ({
									id: Math.random().toString(36).substr(2, 9), // Generate a unique ID
									startTime: null,
									endTime: null
								}))
						]
					}
				}
				return dayAvailability
			})
		})
	}

	const canAddTimeSlot = (dayAvailability: DayAvailability): boolean => {
		if (dayAvailability.timeSlots.length === 0) return true
		const lastSlot = dayAvailability.timeSlots[dayAvailability.timeSlots.length - 1]
		if (!lastSlot.startTime || !lastSlot.endTime) return false

		const endOfDay = setHours(setMinutes(new Date(), 0), 24)
		let lastSlotEnd = lastSlot.endTime
		if (lastSlotEnd.getHours() === 0 && lastSlotEnd.getMinutes() === 0) {
			lastSlotEnd = endOfDay
		}

		if (lastSlotEnd.getHours() === 23 && lastSlotEnd.getMinutes() === 59) {
			return false
		}

		const remainingMinutes = differenceInMinutes(endOfDay, lastSlotEnd)
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
					<motion.div
						key={dayIndex}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
						className="border border-border p-4 sm:p-6 rounded-lg space-y-4 bg-card shadow-md"
					>
						<div className="flex flex-wrap justify-between items-center gap-2">
							<h3 className="text-xl font-semibold text-card-foreground">{availability.day}</h3>
							<div className="flex gap-2">
								{availability.timeSlots.length > 0 && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<span>
													<Button
														type="button"
														onClick={() => copyDay(dayIndex)}
														disabled={!canCopyDay(availability)}
														variant="outline"
														size="sm"
														className="flex-shrink-0"
													>
														<Copy size={16} className="mr-2" /> Copy
													</Button>
												</span>
											</TooltipTrigger>
											<TooltipContent>
												<p>
													{canCopyDay(availability)
														? "Copy this day's schedule"
														: 'All time slots must have From and To times to copy'}
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
								{clipboard && clipboard.length > 0 && (
									<Button
										type="button"
										onClick={() => pasteDay(dayIndex)}
										variant="outline"
										size="sm"
										className="flex-shrink-0"
									>
										<Clipboard size={16} className="mr-2" /> Paste
									</Button>
								)}
							</div>
						</div>
						<AnimatePresence>
							{availability.timeSlots.map((slot, slotIndex) => (
								<TimeSlot
									key={slotIndex}
									dayIndex={dayIndex}
									slotIndex={slotIndex}
									startTime={slot.startTime}
									endTime={slot.endTime}
									previousEndTime={
										slotIndex > 0 ? availability.timeSlots[slotIndex - 1].endTime : null
									}
									nextStartTime={
										slotIndex < availability.timeSlots.length - 1
											? availability.timeSlots[slotIndex + 1].startTime
											: null
									}
									isLastSlot={slotIndex === availability.timeSlots.length - 1}
									updateTimeSlot={updateTimeSlot}
									removeTimeSlot={removeTimeSlot}
								/>
							))}
						</AnimatePresence>
						<Button
							type="button"
							onClick={() => addTimeSlot(dayIndex)}
							variant="outline"
							disabled={!canAddTimeSlot(availability)}
							className="w-full mt-4"
						>
							<Plus size={16} className="mr-2" /> Add Time Slot
						</Button>
					</motion.div>
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

export default TutorAvailabilityForm
