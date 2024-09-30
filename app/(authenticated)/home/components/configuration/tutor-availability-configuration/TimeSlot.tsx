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
import {
	addMinutes,
	differenceInMinutes,
	parse,
	format,
	setHours,
	setMinutes,
	isValid,
	endOfDay,
	isBefore
} from 'date-fns'
import { motion } from 'framer-motion'
import { Clock, Trash2, ChevronsUpDown } from 'lucide-react'
import { generateTimeOptions } from './utils'

interface TimeSlotProps {
	dayIndex: number
	slotIndex: number
	startTime: Date | null
	endTime: Date | null
	previousEndTime: Date | null
	nextStartTime: Date | null
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
		const minStart = previousEndTime || new Date().setHours(0, 0, 0, 0)
		const maxStart = endTime ? addMinutes(endTime, -60) : setHours(setMinutes(new Date(), 0), 23)

		setFromOptions(
			generateTimeOptions(new Date(minStart), maxStart).map((time) => ({
				value: time,
				label: time
			}))
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

export default TimeSlot
