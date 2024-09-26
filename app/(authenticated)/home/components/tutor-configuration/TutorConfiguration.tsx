'use client'

import React from 'react'
import { create } from 'zustand'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { api, GetMeResponse, LearningSystem, Subject } from '@/app/api'
import { AnimatePresence, motion } from 'framer-motion'

interface StoreState {
	selectedSystems: string[]
	selectedSubjects: string[]
	selectedQualifications: string[]
	searchSystem: string
	searchSubject: string
	searchQualification: string
	currentStep: number
	setSelectedSystems: (ids: string[]) => void
	setSelectedSubjects: (ids: string[]) => void
	setSelectedQualifications: (ids: string[]) => void
	setSearchSystem: (search: string) => void
	setSearchSubject: (search: string) => void
	setSearchQualification: (search: string) => void
	setCurrentStep: (step: number) => void
}

const useStore = create<StoreState>((set) => ({
	selectedSystems: [],
	selectedSubjects: [],
	selectedQualifications: [],
	searchSystem: '',
	searchSubject: '',
	searchQualification: '',
	currentStep: 1,
	setSelectedSystems: (ids) =>
		set({ selectedSystems: ids, selectedSubjects: [], selectedQualifications: [] }),
	setSelectedSubjects: (ids) => set({ selectedSubjects: ids, selectedQualifications: [] }),
	setSelectedQualifications: (ids) => set({ selectedQualifications: ids }),
	setSearchSystem: (search) => set({ searchSystem: search }),
	setSearchSubject: (search) => set({ searchSubject: search }),
	setSearchQualification: (search) => set({ searchQualification: search }),
	setCurrentStep: (step) => set({ currentStep: step })
}))

const StepIndicator: React.FC<{ step: number; currentStep: number }> = ({ step, currentStep }) => {
	const isActive = step === currentStep
	const isCompleted = step < currentStep

	return (
		<div className="flex flex-col items-center">
			<div
				className={`w-10 h-10 rounded-full flex items-center justify-center ${
					isActive
						? 'bg-primary text-primary-foreground'
						: isCompleted
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground'
				}`}
			>
				{isCompleted ? <Check className="h-6 w-6" /> : step}
			</div>
			<div className="text-sm mt-2">
				{step === 1 ? 'Systems' : step === 2 ? 'Subjects' : 'Qualifications'}
			</div>
		</div>
	)
}

const SubjectTree: React.FC<{
	subjects: Subject[]
	selectedSubjects: string[]
	onSubjectToggle: (subjectId: string) => void
}> = ({ subjects, selectedSubjects, onSubjectToggle }) => {
	return (
		<div className="space-y-2">
			{subjects.map((subject) => (
				<div key={subject.id} className="flex items-center space-x-2">
					<Checkbox
						id={`subject-${subject.id}`}
						checked={selectedSubjects.includes(subject.id)}
						onCheckedChange={() => onSubjectToggle(subject.id)}
					/>
					<label
						htmlFor={`subject-${subject.id}`}
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						{subject.name}
					</label>
				</div>
			))}
		</div>
	)
}

interface TutorConfigurationMultiStepFormProps {
	userData: GetMeResponse
}

const TutorConfigurationMultiStepForm: React.FC<TutorConfigurationMultiStepFormProps> = ({
	userData
}) => {
	const {
		selectedSystems,
		selectedSubjects,
		selectedQualifications,
		searchSystem,
		searchSubject,
		searchQualification,
		currentStep,
		setSelectedSystems,
		setSelectedSubjects,
		setSelectedQualifications,
		setSearchSystem,
		setSearchSubject,
		setSearchQualification,
		setCurrentStep
	} = useStore()

	const queryClient = useQueryClient()
	const { toast } = useToast()

	const { data: learningSystems = [], error: fetchError } = useQuery<LearningSystem[], Error>({
		queryKey: ['learningSystems'],
		queryFn: api.getLearningSystems
	})

	React.useEffect(() => {
		if (fetchError) {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to fetch learning systems: ${fetchError.message}`
			})
		}
	}, [fetchError, toast])

	console.log(userData)
	const saveMutation = useMutation({
		mutationFn: (qualificationIds: string[]) =>
			api.setTutorConfiguration(userData.personId, qualificationIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tutorConfiguration'] })
			toast({
				title: 'Success',
				description: 'Your configuration has been saved successfully.'
			})
		},
		onError: (error) => {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to save configuration: ${error.message}`
			})
		}
	})

	const handleSave = () => {
		saveMutation.mutate(selectedQualifications)
	}

	const filteredSystems = learningSystems.filter((system) =>
		system.name.toLowerCase().includes(searchSystem.toLowerCase())
	)

	const handleNext = () => {
		if (currentStep < 3) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const canProceedToNextStep = () => {
		switch (currentStep) {
			case 1:
				return selectedSystems.length > 0
			case 2:
				return selectedSubjects.length > 0
			case 3:
				return selectedQualifications.length > 0
			default:
				return false
		}
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						<Card>
							<CardHeader>
								<CardTitle>Step 1: Select Learning Systems</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<Input
										type="text"
										value={searchSystem}
										onChange={(e) => setSearchSystem(e.target.value)}
										placeholder="Search systems"
										className="w-full"
									/>
									<ScrollArea className="h-[400px] pr-4">
										{filteredSystems.length > 0 ? (
											filteredSystems.map((system) => (
												<div key={system.id} className="flex items-center space-x-2 py-2">
													<Checkbox
														id={`system-${system.id}`}
														checked={selectedSystems.includes(system.id)}
														onCheckedChange={() => {
															setSelectedSystems(
																selectedSystems.includes(system.id)
																	? selectedSystems.filter((id) => id !== system.id)
																	: [...selectedSystems, system.id]
															)
														}}
													/>
													<label
														htmlFor={`system-${system.id}`}
														className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
													>
														{system.name}
													</label>
												</div>
											))
										) : (
											<p className="text-muted-foreground">No learning systems found</p>
										)}
									</ScrollArea>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)
			case 2:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						<Card>
							<CardHeader>
								<CardTitle>Step 2: Select Subjects</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<Input
										type="text"
										value={searchSubject}
										onChange={(e) => setSearchSubject(e.target.value)}
										placeholder="Search subjects within selected systems"
										className="w-full"
									/>
									<ScrollArea className="h-[400px] pr-4">
										{filteredSystems
											.filter((system) => selectedSystems.includes(system.id))
											.map((system) => {
												const filteredSubjects = system.subjects.filter((subject) =>
													subject.name.toLowerCase().includes(searchSubject.toLowerCase())
												)

												if (filteredSubjects.length === 0) return null

												return (
													<div key={system.id} className="mb-4">
														<h3 className="text-lg font-semibold mb-2">{system.name} System</h3>
														<SubjectTree
															subjects={filteredSubjects}
															selectedSubjects={selectedSubjects}
															onSubjectToggle={(subjectId) => {
																setSelectedSubjects(
																	selectedSubjects.includes(subjectId)
																		? selectedSubjects.filter((id) => id !== subjectId)
																		: [...selectedSubjects, subjectId]
																)
															}}
														/>
													</div>
												)
											})}
										{filteredSystems.filter((system) => selectedSystems.includes(system.id))
											.length === 0 && <p className="text-muted-foreground">No subjects found</p>}
									</ScrollArea>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)
			case 3:
				return (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						<Card>
							<CardHeader>
								<CardTitle>Step 3: Select Qualifications</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<Input
										type="text"
										value={searchQualification}
										onChange={(e) => setSearchQualification(e.target.value)}
										placeholder="Search qualifications"
										className="w-full"
									/>
									<ScrollArea className="h-[400px] pr-4">
										{filteredSystems
											.filter((system) => selectedSystems.includes(system.id))
											.map((system) => {
												const subjectsWithQualifications = system.subjects
													.filter((subject) => selectedSubjects.includes(subject.id))
													.filter((subject) =>
														subject.qualifications.some((qualification) =>
															qualification.name
																.toLowerCase()
																.includes(searchQualification.toLowerCase())
														)
													)

												if (subjectsWithQualifications.length === 0) return null

												return (
													<div key={system.id} className="mb-6">
														<h3 className="text-xl font-bold mb-3">{system.name} System</h3>
														{subjectsWithQualifications.map((subject) => (
															<div key={subject.id} className="mb-4 ml-4">
																<h4 className="text-lg font-semibold mb-2">{subject.name}</h4>
																{subject.qualifications
																	.filter((qualification) =>
																		qualification.name
																			.toLowerCase()
																			.includes(searchQualification.toLowerCase())
																	)
																	.map((qualification) => (
																		<div
																			key={qualification.id}
																			className="flex items-center space-x-2 py-1 ml-4"
																		>
																			<Checkbox
																				id={`qualification-${qualification.id}`}
																				checked={selectedQualifications.includes(qualification.id)}
																				onCheckedChange={() => {
																					setSelectedQualifications(
																						selectedQualifications.includes(qualification.id)
																							? selectedQualifications.filter(
																									(id) => id !== qualification.id
																								)
																							: [...selectedQualifications, qualification.id]
																					)
																				}}
																			/>
																			<label
																				htmlFor={`qualification-${qualification.id}`}
																				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																			>
																				{qualification.name}
																			</label>
																		</div>
																	))}
															</div>
														))}
													</div>
												)
											})}
										{filteredSystems.filter((system) => selectedSystems.includes(system.id))
											.length === 0 && (
											<p className="text-muted-foreground">No qualifications found</p>
										)}
									</ScrollArea>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)
			default:
				return null
		}
	}
	return (
		<motion.div
			className="space-y-6 max-w-7xl mx-auto"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<h1 className="text-3xl font-bold">Tutor Configuration</h1>
			<p className="text-muted-foreground">
				Before starting your experience you will need to select your qualifications.
			</p>

			<div className="flex justify-between items-center mb-8">
				<StepIndicator step={1} currentStep={currentStep} />
				<div className="h-1 flex-1 bg-muted mx-4">
					<div
						className="h-1 bg-primary transition-all duration-300 ease-in-out"
						style={{ width: `${(Math.min(currentStep - 1, 1) / 1) * 100}%` }}
					></div>
				</div>
				<StepIndicator step={2} currentStep={currentStep} />
				<div className="h-1 flex-1 bg-muted mx-4">
					<div
						className="h-1 bg-primary transition-all duration-300 ease-in-out"
						style={{ width: `${(Math.max(0, Math.min(currentStep - 2, 1)) / 1) * 100}%` }}
					></div>
				</div>
				<StepIndicator step={3} currentStep={currentStep} />
			</div>

			<AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

			<Card>
				<CardFooter className="flex justify-between pt-6">
					<div>
						{currentStep > 1 && (
							<Button onClick={handlePrevious} variant="outline">
								<ArrowLeft className="mr-2 h-4 w-4" /> Previous
							</Button>
						)}
					</div>
					<div>
						{currentStep < 3 ? (
							<Button onClick={handleNext} disabled={!canProceedToNextStep()}>
								Next <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Button
								onClick={handleSave}
								disabled={saveMutation.isPending || !canProceedToNextStep()}
							>
								{saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
								{!saveMutation.isPending && <Check className="ml-2 h-4 w-4" />}
							</Button>
						)}
					</div>
				</CardFooter>
			</Card>
		</motion.div>
	)
}

export default TutorConfigurationMultiStepForm
