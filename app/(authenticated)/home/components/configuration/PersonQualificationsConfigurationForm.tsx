'use client'

import React from 'react'
import { create } from 'zustand'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { api, GetMeResponse, LearningSystem, PersonType, Qualification, Subject } from '@/app/api'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface StoreState {
	selectedItems: Record<string, string[]>
	searchTerms: Record<string, string>
	currentStep: number
	setSelectedItems: (step: string, ids: string[]) => void
	setSearchTerm: (step: string, search: string) => void
	setCurrentStep: (step: number) => void
}

const useStore = create<StoreState>((set) => ({
	selectedItems: {
		systems: [],
		subjects: [],
		qualifications: []
	},
	searchTerms: {
		systems: '',
		subjects: '',
		qualifications: ''
	},
	currentStep: 1,
	setSelectedItems: (step, ids) =>
		set((state) => ({
			selectedItems: { ...state.selectedItems, [step]: ids }
		})),
	setSearchTerm: (step, search) =>
		set((state) => ({
			searchTerms: { ...state.searchTerms, [step]: search }
		})),
	setCurrentStep: (step) => set({ currentStep: step })
}))

const StepIndicator: React.FC<{ step: number; currentStep: number; label: string }> = ({
	step,
	currentStep,
	label
}) => {
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
			<div className="text-sm mt-2">{label}</div>
		</div>
	)
}

type SystemItem = LearningSystem
type SubjectItem = { id: string; name: string; subjects: Subject[] }
type QualificationItem = { id: string; name: string; qualifications: Qualification[] }

type StepItem = SystemItem | SubjectItem | QualificationItem

interface ItemListProps {
	items: StepItem[]
	selectedItems: string[]
	onItemToggle: (itemId: string) => void
	itemType: 'system' | 'subject' | 'qualification'
	step: number
}

interface ItemListProps {
	items: StepItem[]
	selectedItems: string[]
	onItemToggle: (itemId: string) => void
	itemType: 'system' | 'subject' | 'qualification'
	step: number
}

const ItemList: React.FC<ItemListProps> = ({
	items,
	selectedItems,
	onItemToggle,
	itemType,
	step
}) => {
	if (items.length === 0) {
		return (
			<p className="text-muted-foreground">No {itemType}s found matching your search criteria.</p>
		)
	}

	return (
		<div className="space-y-">
			{items.map((item) => (
				<div key={item.id} className="mb-4">
					<div className="flex items-center space-x-2 font-semibold">
						{step === 1 && (
							<>
								<Checkbox
									id={`${itemType}-${item.id}`}
									checked={selectedItems.includes(item.id)}
									onCheckedChange={() => onItemToggle(item.id)}
								/>
								<label htmlFor={`${itemType}-${item.id}`}>{item.name}</label>
							</>
						)}
						{step === 2 && 'subjects' in item && (
							<>
								<span>{item.name}</span>
								<div className="ml-6 mt-2 space-y-2">
									{item.subjects.map((subject) => (
										<div key={subject.id} className="flex items-center space-x-2">
											<Checkbox
												id={`subject-${subject.id}`}
												checked={selectedItems.includes(subject.id)}
												onCheckedChange={() => onItemToggle(subject.id)}
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
							</>
						)}
						{step === 3 && 'qualifications' in item && (
							<>
								<span>{item.name}</span>
								<div className="ml-6 mt-2 space-y-2">
									{item.qualifications.map((qual) => (
										<div key={qual.id} className="flex items-center space-x-2">
											<Checkbox
												id={`qualification-${qual.id}`}
												checked={selectedItems.includes(qual.id)}
												onCheckedChange={() => onItemToggle(qual.id)}
											/>
											<label
												htmlFor={`qualification-${qual.id}`}
												className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											>
												{qual.name}
											</label>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			))}
		</div>
	)
}

interface ConfigurationMultiStepFormProps {
	userData: GetMeResponse
}

const PersonQualificationsConfigurationForm: React.FC<ConfigurationMultiStepFormProps> = ({
	userData
}) => {
	const {
		selectedItems,
		searchTerms,
		currentStep,
		setSelectedItems,
		setSearchTerm,
		setCurrentStep
	} = useStore()

	const { toast } = useToast()
	const router = useRouter()
	const queryClient = useQueryClient()

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

	const saveMutation = useMutation({
		mutationFn: (qualificationIds: string[]) => {
			if (userData.type === PersonType.Tutor) {
				return api.setTutorQualifications(userData.personId, qualificationIds)
			} else {
				return api.setStudentQualifications(userData.personId, qualificationIds)
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['getMe']
			})

			toast({
				title: 'Success',
				description: 'Your configuration has been saved successfully.'
			})

			router.refresh()
		},
		onError: (error) => {
			toast({
				variant: 'destructive',
				title: 'Error',
				description: `Failed to save configuration: ${(error as Error).message}`
			})
		}
	})

	const handleSave = () => {
		saveMutation.mutate(selectedItems.qualifications)
	}

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
		const step = ['systems', 'subjects', 'qualifications'][currentStep - 1]
		return selectedItems[step].length > 0
	}

	const renderStep = () => {
		const steps: {
			key: 'systems' | 'subjects' | 'qualifications'
			title: string
			items: StepItem[]
			notFoundMessage: string
		}[] = [
			{
				key: 'systems',
				title: 'Select Learning Systems',
				items: learningSystems.filter((system) =>
					system.name.toLowerCase().includes(searchTerms.systems.toLowerCase())
				),
				notFoundMessage: 'No learning systems available. Please contact support.'
			},
			{
				key: 'subjects',
				title: 'Select Subjects',
				items: learningSystems
					.filter((system) => selectedItems.systems.includes(system.id))
					.map((system) => ({
						id: system.id,
						name: system.name,
						subjects: system.subjects.filter((subject) =>
							subject.name.toLowerCase().includes(searchTerms.subjects.toLowerCase())
						)
					}))
					.filter((system) => system.subjects.length > 0),
				notFoundMessage:
					'No subjects found matching your search criteria. Please try a different search term or go back to select different learning systems.'
			},
			{
				key: 'qualifications',
				title: 'Select Qualifications',
				items: learningSystems
					.filter((system) => selectedItems.systems.includes(system.id))
					.flatMap((system) =>
						system.subjects
							.filter((subject) => selectedItems.subjects.includes(subject.id))
							.map((subject) => ({
								id: subject.id,
								name: subject.name,
								qualifications: subject.qualifications.filter((qual) =>
									qual.name.toLowerCase().includes(searchTerms.qualifications.toLowerCase())
								)
							}))
					)
					.filter((subject) => subject.qualifications.length > 0),
				notFoundMessage:
					'No qualifications found matching your search criteria. Please try a different search term or go back to select different subjects.'
			}
		]

		const currentStepData = steps[currentStep - 1]

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ duration: 0.3 }}
			>
				<Card>
					<CardHeader>
						<CardTitle>
							Step {currentStep}: {currentStepData.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<Input
								type="text"
								value={searchTerms[currentStepData.key]}
								onChange={(e) => setSearchTerm(currentStepData.key, e.target.value)}
								placeholder={`Search ${currentStepData.key}`}
								className="w-full"
							/>
							<ScrollArea className="h-[400px] pr-4">
								{currentStepData.items.length > 0 ? (
									<ItemList
										items={currentStepData.items}
										selectedItems={selectedItems[currentStepData.key]}
										onItemToggle={(itemId) => {
											setSelectedItems(
												currentStepData.key,
												selectedItems[currentStepData.key].includes(itemId)
													? selectedItems[currentStepData.key].filter((id) => id !== itemId)
													: [...selectedItems[currentStepData.key], itemId]
											)
										}}
										itemType={
											currentStepData.key.slice(0, -1) as 'system' | 'subject' | 'qualification'
										}
										step={currentStep}
									/>
								) : (
									<p className="text-muted-foreground">{currentStepData.notFoundMessage}</p>
								)}
							</ScrollArea>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		)
	}

	return (
		<motion.div
			className="space-y-6 max-w-7xl mx-auto"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<h1 className="text-3xl font-bold">
				{userData.type === PersonType.Tutor ? 'Tutor Configuration' : 'Student Configuration'}
			</h1>
			<p className="text-muted-foreground">
				Please select your learning systems, subjects, and qualifications to personalize your
				experience.
			</p>

			<div className="flex justify-between items-center mb-8">
				{['Systems', 'Subjects', 'Qualifications'].map((label, index) => (
					<React.Fragment key={label}>
						<StepIndicator step={index + 1} currentStep={currentStep} label={label} />
						{index < 2 && (
							<div className="h-1 flex-1 bg-muted mx-4">
								<div
									className="h-1 bg-primary transition-all duration-300 ease-in-out"
									style={{
										width: `${(Math.max(0, Math.min(currentStep - index - 1, 1)) / 1) * 100}%`
									}}
								></div>
							</div>
						)}
					</React.Fragment>
				))}
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

export default PersonQualificationsConfigurationForm
