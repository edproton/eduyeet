import React, { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { api, FindAvailableTutorsResponse } from '@/app/api'

// Types
export interface GetStudentWithQualificationsResponse {
	id: string
	name: string
	qualifications: Qualification[]
}

export interface Qualification {
	id: string
	name: string
}

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

export default function BookingsComponentWithApiIntegration({ studentId }: { studentId: string }) {
	const queryClient = useQueryClient()
	const [step, setStep] = useState(1)
	const [selectedQualification, setSelectedQualification] = useState<string>('')
	const [selectedDate, setSelectedDate] = useState<string>('')
	const [tempDate, setTempDate] = useState('')

	useEffect(() => {
		// Set initial value to current UTC time
		const now = new Date()
		const utcString = now.toISOString().slice(0, 16)
		setTempDate(utcString)
	}, [])

	const handleDateChange = (e) => {
		const localDate = new Date(e.target.value)
		const utcString = localDate.toISOString().slice(0, 16)
		setTempDate(utcString)
	}

	const formatForDisplay = (utcString: string) => {
		return utcString.replace('T', ' ') + ' UTC'
	}
	const [selectedTutor, setSelectedTutor] = useState<string>('')

	const {
		data: studentData,
		isLoading: isLoadingStudent,
		error: studentError
	} = useQuery<GetStudentWithQualificationsResponse>({
		queryKey: ['student', studentId],
		queryFn: () => api.getStudent(studentId)
	})

	const {
		data: bookings,
		isLoading: isLoadingBookings,
		error: bookingsError
	} = useQuery<CreateBookingResponse[]>({
		queryKey: ['bookings', studentId],
		queryFn: () => api.getStudentBookings(studentId)
	})

	const {
		data: availableTutors,
		isLoading: isLoadingTutors,
		error: tutorsError
	} = useQuery<FindAvailableTutorsResponse>({
		queryKey: ['availableTutors', selectedQualification, selectedDate],
		queryFn: () =>
			api.findAvailableTutors({
				qualificationId: selectedQualification,
				requestedDateTime: selectedDate
			}),
		enabled: !!selectedQualification && !!selectedDate
	})

	const createBookingMutation = useMutation({
		mutationFn: api.createBooking,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['bookings', studentId]
			})
			setStep(1)
			setSelectedQualification('')
			setSelectedDate('')
			setSelectedTutor('')
		}
	})

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		if (step === 2) {
			setSelectedDate(tempDate)
		}
		if (step === 3) {
			const bookingData: CreateBookingCommand = {
				studentId,
				tutorId: selectedTutor,
				qualificationId: selectedQualification,
				startTime: selectedDate
			}
			createBookingMutation.mutate(bookingData)
		} else {
			setStep(step + 1)
		}
	}

	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<div>
						<Label htmlFor="qualification">Select Qualification</Label>
						<Select
							onValueChange={(value) => setSelectedQualification(value)}
							value={selectedQualification}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a qualification" />
							</SelectTrigger>
							<SelectContent>
								{studentData?.qualifications.map((qual) => (
									<SelectItem key={qual.id} value={qual.id}>
										{qual.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)
			case 2:
				return (
					<div className="flex flex-col space-y-2">
						<input
							id="date"
							type="datetime-local"
							value={tempDate}
							onChange={handleDateChange}
							required
							className="border rounded p-2"
						/>
						<p className="text-sm text-gray-600">Selected UTC time: {formatForDisplay(tempDate)}</p>
					</div>
				)
			case 3:
				return (
					<div>
						<Label htmlFor="tutor">Select Tutor</Label>
						<Select onValueChange={(value) => setSelectedTutor(value)} value={selectedTutor}>
							<SelectTrigger>
								<SelectValue placeholder="Select a tutor" />
							</SelectTrigger>
							<SelectContent>
								{availableTutors?.availableTutors.map((tutor) => (
									<SelectItem key={tutor.id} value={tutor.id}>
										{`${tutor.name}`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)
		}
	}

	if (isLoadingStudent || isLoadingBookings || isLoadingTutors) return <div>Loading data...</div>
	if (studentError || bookingsError || tutorsError)
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>
					Failed to load data: {((studentError || bookingsError || tutorsError) as Error).message}
				</AlertDescription>
			</Alert>
		)

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Book a Lesson for {studentData?.name}</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{renderStep()}
						<Button
							type="submit"
							disabled={createBookingMutation.isPending || (step === 3 && !selectedTutor)}
						>
							{step === 3
								? createBookingMutation.isPending
									? 'Creating Booking...'
									: 'Create Booking'
								: 'Next'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Your Bookings</CardTitle>
				</CardHeader>
				<CardContent>
					{bookings && bookings.length > 0 ? (
						<ul className="space-y-2">
							{bookings.map((booking) => (
								<li key={booking.id}>
									<Card>
										<CardContent className="p-4">
											<p>Booking ID: {booking.id}</p>
											<p>Tutor ID: {booking.tutorId}</p>
											<p>Qualification ID: {booking.qualificationId}</p>
											<p>Start Time: {format(new Date(booking.startTime), 'PPpp')}</p>
											<p>End Time: {format(new Date(booking.endTime), 'PPpp')}</p>
										</CardContent>
									</Card>
								</li>
							))}
						</ul>
					) : (
						<p>No bookings found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
