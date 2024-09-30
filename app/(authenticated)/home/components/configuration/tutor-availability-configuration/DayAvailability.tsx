import React from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Copy, Clipboard } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import TimeSlot from './TimeSlot'
import { DayAvailability as DayAvailabilityType, TimeSlot as TimeSlotType } from './utils'

interface DayAvailabilityProps {
	availability: DayAvailabilityType
	dayIndex: number
	updateTimeSlot: (
		dayIndex: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: Date | null
	) => void
	removeTimeSlot: (dayIndex: number, slotIndex: number) => void
	addTimeSlot: (dayIndex: number) => void
	copyDay: (dayIndex: number) => void
	pasteDay: (dayIndex: number) => void
	canCopyDay: (dayAvailability: DayAvailabilityType) => boolean
	canAddTimeSlot: (dayAvailability: DayAvailabilityType) => boolean
	clipboard: TimeSlotType[] | null
}

const DayAvailability: React.FC<DayAvailabilityProps> = ({
	availability,
	dayIndex,
	updateTimeSlot,
	removeTimeSlot,
	addTimeSlot,
	copyDay,
	pasteDay,
	canCopyDay,
	canAddTimeSlot,
	clipboard
}) => {
	return (
		<motion.div
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
						previousEndTime={slotIndex > 0 ? availability.timeSlots[slotIndex - 1].endTime : null}
						nextStartTime={
							slotIndex < availability.timeSlots.length - 1
								? availability.timeSlots[slotIndex + 1].startTime
								: null
						}
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
	)
}

export default DayAvailability
