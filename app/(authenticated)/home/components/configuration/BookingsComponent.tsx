import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Flag from 'react-world-flags'
import { Calendar } from '@/components/ui/calendar'
import {
	FindAvailableTutorsResponse,
	GetAllTutorsByQualificationIdResponse,
	FindTutorAvailabilityParams,
	GetStudentWithQualificationsResponse,
	GetMeResponse,
	CreateBookingCommand,
	CreateBookingResponse
} from '@/api/types'
import { Clock, CalendarIcon, Info, Search, Star, ChevronLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { studentApi } from '@/api/student'
import { authApi } from '@/api/auth'
import { bookingApi } from '@/api/booking'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function ImprovedBookingPage() {
	const [selectedQualification, setSelectedQualification] = useState<string | null>(null)
	const [selectedTutor, setSelectedTutor] = useState<string | null>(null)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [bookingConfirmation, setBookingConfirmation] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	// Fetch user data
	const {
		data: userData,
		isLoading: isUserLoading,
		isError: isUserError
	} = useQuery<GetMeResponse>({
		queryKey: ['userData'],
		queryFn: authApi.getMe
	})

	const queryClient = useQueryClient()

	// Fetch student qualifications
	const {
		data: studentData,
		isLoading: isStudentLoading,
		isError: isStudentError
	} = useQuery<GetStudentWithQualificationsResponse>({
		queryKey: ['studentQualifications', userData?.personId],
		queryFn: () => studentApi.getStudentWithQualifications(userData!.personId),
		enabled: !!userData?.personId
	})

	// Fetch tutors using Tanstack Query
	const { data: tutorsData } = useQuery<GetAllTutorsByQualificationIdResponse>({
		queryKey: ['tutors', selectedQualification],
		queryFn: () =>
			bookingApi.getAllTutorsByQualificationId({ qualificationId: selectedQualification! }),
		enabled: !!selectedQualification
	})

	// Fetch tutor availability
	const {
		data: availabilityData,
		isError: isAvailabilityError,
		refetch: refetchAvailability
	} = useQuery<FindAvailableTutorsResponse>({
		queryKey: ['tutorAvailability', selectedTutor, selectedDate, userData?.timeZoneId],
		queryFn: () => {
			if (!selectedTutor || !selectedDate || !userData?.timeZoneId) {
				throw new Error('Missing required data for fetching availability')
			}

			const params: FindTutorAvailabilityParams = {
				tutorId: selectedTutor,
				day: selectedDate.getDate(),
				month: selectedDate.getMonth() + 1,
				year: selectedDate.getFullYear(),
				timeZoneId: userData.timeZoneId
			}

			return bookingApi.findTutorAvailability(params)
		},
		enabled: !!(selectedQualification && selectedTutor && selectedDate && userData?.timeZoneId)
	})

	const handleQualificationChange = (qualificationId: string) => {
		setSelectedQualification(qualificationId)
		setSelectedTutor(null)
		setSelectedDate(null)
		setBookingConfirmation(null)
		setSearchQuery('')
	}

	const handleTutorSelect = (tutorId: string) => {
		setSelectedTutor(tutorId)
		setSelectedDate(null)
	}

	const handleDateSelect = (date: Date | undefined) => {
		if (!date) return
		setSelectedDate(date)
	}

	const createBookingMutation = useMutation<CreateBookingResponse, Error, CreateBookingCommand>({
		mutationFn: (data: CreateBookingCommand) => bookingApi.createBooking(data),
		onSuccess: (data) => {
			setBookingConfirmation(
				`Booking confirmed with tutor ${data.tutorId} on ${new Date(data.startTime).toLocaleString()} to ${new Date(data.endTime).toLocaleTimeString()}`
			)

			// Refetch relevant queries
			queryClient.invalidateQueries({ queryKey: ['bookings'] })
			queryClient.invalidateQueries({ queryKey: ['studentBookings', data.studentId] })
			refetchAvailability() // Refetch availability after successful booking
		},
		onError: (error) => {
			console.error('Error creating booking:', error)
		}
	})

	const handleBooking = (tutorId: string, startTime: string) => {
		if (selectedQualification && userData?.personId && selectedDate) {
			const [year, month, day] = [
				selectedDate.getFullYear(),
				String(selectedDate.getMonth() + 1).padStart(2, '0'),
				String(selectedDate.getDate()).padStart(2, '0')
			]

			const startDateTime = `${year}-${month}-${day}T${startTime}:00`

			const bookingData: CreateBookingCommand = {
				studentId: userData.personId,
				tutorId: tutorId,
				qualificationId: selectedQualification,
				startTime: startDateTime
			}

			createBookingMutation.mutate(bookingData)
		}
	}

	const filteredTutors = useMemo(() => {
		return (
			tutorsData?.tutors.filter((tutor) =>
				tutor.name.toLowerCase().includes(searchQuery.toLowerCase())
			) || []
		)
	}, [tutorsData, searchQuery])

	const availableTimeslots = useMemo(() => {
		if (!availabilityData || availabilityData.availability.timeslots.length === 0) return []
		return availabilityData.availability.timeslots.flatMap((a) => a)
	}, [availabilityData])

	if (isUserLoading || isStudentLoading) return <p>Loading user data...</p>
	if (isUserError || isStudentError) return <p>Error loading user data. Please try again.</p>

	return (
		<div className="container mx-auto p-4">
			<Card className="w-full max-w-4xl mx-auto">
				<CardHeader>
					<CardTitle>Book a Tutor</CardTitle>
					<CardDescription>
						Welcome, {userData?.name}! Select a qualification to find available tutors
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<Select onValueChange={handleQualificationChange}>
							<SelectTrigger className="w-full">
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

						{tutorsData && tutorsData.tutors.length > 0 && !selectedTutor && (
							<div className="space-y-4">
								<div className="sticky top-0 bg-background pt-2 pb-2 z-10">
									<h3 className="text-lg font-semibold mb-2">Available Tutors:</h3>
									<div className="relative">
										<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											type="text"
											placeholder="Search by name or country"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-8"
										/>
									</div>
								</div>
								<ScrollArea className="h-[400px]">
									<div className="space-y-4 pr-4">
										{filteredTutors.map((tutor) => (
											<Card
												key={tutor.id}
												className="cursor-pointer transition-all hover:bg-accent"
												onClick={() => handleTutorSelect(tutor.id)}
											>
												<CardContent className="flex items-center p-4">
													<Avatar className="h-12 w-12 mr-4">
														{/* <AvatarImage src={tutor.avatar} alt={tutor.name} /> */}
														<AvatarFallback>
															{tutor.name
																.split(' ')
																.map((n) => n[0])
																.join('')}
														</AvatarFallback>
													</Avatar>
													<div className="flex-grow">
														<div className="flex items-center justify-between mb-1">
															<h4 className="font-semibold">{tutor.name}</h4>
															<div className="flex items-center">
																<Star className="h-4 w-4 text-yellow-500 mr-1" />
																{/* <span>{tutor.rating?.toFixed(1)}</span> */}
																<span>{4.7}</span>
															</div>
														</div>
														<div className="flex items-center mt-1">
															<Flag code={'620'} height="12" width="18" className="mr-2" />
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								</ScrollArea>
							</div>
						)}

						{selectedTutor && (
							<div className="space-y-4">
								<Button variant="outline" onClick={() => setSelectedTutor(null)} className="mb-4">
									<ChevronLeft className="mr-2 h-4 w-4" />
									Back to Tutors
								</Button>
								<div className="flex flex-col md:flex-row gap-4">
									<div className="md:w-auto">
										<h3 className="text-lg font-semibold flex items-center mb-2">
											<CalendarIcon className="mr-2" />
											Select a Date
										</h3>
										<Card className="p-3">
											<Calendar
												mode="single"
												selected={selectedDate || undefined}
												onSelect={handleDateSelect}
												className="w-full"
												disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
											/>
										</Card>
									</div>
									<div className="flex-grow">
										<h4 className="font-semibold mb-2 flex items-center">
											<Clock className="mr-2" size={18} />
											Available Times:
										</h4>
										<div className="h-[300px] relative">
											{isAvailabilityError && <p>Error fetching availability. Please try again.</p>}
											{selectedDate && availableTimeslots.length > 0 ? (
												<ScrollArea className="h-full">
													<div className="grid grid-cols-2 md:grid-cols-3 gap-2 pr-4">
														{availableTimeslots.map((slot, index) => (
															<Button
																key={index}
																onClick={() => handleBooking(selectedTutor!, slot.startTime)}
																className="flex items-center justify-center w-full"
																variant="outline"
															>
																{slot.startTime} - {slot.endTime}
															</Button>
														))}
													</div>
												</ScrollArea>
											) : (
												<div className="absolute inset-0 flex items-center justify-center">
													<p className="text-center text-muted-foreground px-4">
														{selectedDate
															? 'No available times for the selected date. Please choose another date.'
															: "Ready to start your learning journey? Pick a date that works best for you, and let's make it happen! 📅✨"}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
								<Card className="bg-secondary/50 p-4">
									<h4 className="font-semibold mb-2 flex items-center">
										<Info className="mr-2" size={18} />
										Booking Information
									</h4>
									<ul className="list-disc list-inside text-sm space-y-1">
										<li>
											Lessons are 1 hour long (55 minutes of instruction with a 5-minute break)
										</li>
										<li>Booking is available up to 4 weeks in advance</li>
										<li>You can reschedule or cancel up to 24 hours before the lesson</li>
									</ul>
								</Card>
							</div>
						)}

						{bookingConfirmation && (
							<div
								className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
								role="alert"
							>
								<strong className="font-bold">Success!</strong>
								<span className="block sm:inline"> {bookingConfirmation}</span>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
