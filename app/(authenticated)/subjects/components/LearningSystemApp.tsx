'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Edit2, Check, X, Search, ChevronRight } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiException, LearningSystem, Subject, Qualification, api } from '../../../api'
import { useToast } from '@/components/ui/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SummaryCards } from './SummaryCards'
import { createStore } from './store'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'

const LearningSystemApp: React.FC = () => {
	const useStore = React.useMemo(() => createStore(), [])
	const queryClient = useQueryClient()
	const { toast } = useToast()
	const {
		selectedSystemId,
		selectedSubjectId,
		newSystemName,
		newSubjectName,
		newQualificationName,
		editingSystemId,
		editingSystemName,
		editingSubjectId,
		editingSubjectName,
		editingQualificationId,
		editingQualificationName,
		searchSystem,
		searchSubject,
		searchQualification,
		deleteDialogOpen,
		itemToDelete,
		setSelectedSystemId,
		setSelectedSubjectId,
		setNewSystemName,
		setNewSubjectName,
		setNewQualificationName,
		setEditingSystemId,
		setEditingSystemName,
		setEditingSubjectId,
		setEditingSubjectName,
		setEditingQualificationId,
		setEditingQualificationName,
		setSearchSystem,
		setSearchSubject,
		setSearchQualification,
		setDeleteDialogOpen,
		setItemToDelete
	} = useStore()

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

	const selectedSystem = learningSystems.find((system) => system.id === selectedSystemId)
	const subjects = selectedSystem?.subjects || []
	const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId)
	const qualifications = selectedSubject?.qualifications || []

	const filteredSystems = learningSystems.filter((system) =>
		system.name.toLowerCase().includes(searchSystem.toLowerCase())
	)

	const filteredSubjects = subjects.filter((subject) =>
		subject.name.toLowerCase().includes(searchSubject.toLowerCase())
	)

	const filteredQualifications = qualifications.filter((qualification) =>
		qualification.name.toLowerCase().includes(searchQualification.toLowerCase())
	)

	const handleApiError = (error: ApiException) => {
		toast({
			variant: 'destructive',
			title: 'Error ' + error.code,
			description: error.message
		})
	}

	const createSystemMutation = useMutation({
		mutationFn: api.createLearningSystem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setNewSystemName('')
			toast({
				title: 'Success',
				variant: 'success',
				description: 'Learning system created successfully'
			})
		},
		onError: handleApiError
	})

	const deleteSystemMutation = useMutation({
		mutationFn: api.deleteLearningSystem,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setSelectedSystemId(null)
			toast({
				title: 'Success',
				variant: 'success',
				description: 'Learning system deleted successfully'
			})
		},
		onError: handleApiError
	})

	const updateSystemMutation = useMutation({
		mutationFn: ({ id, name }: { id: string; name: string }) => api.updateLearningSystem(id, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setEditingSystemId(null)
			toast({
				title: 'Success',
				variant: 'success',
				description: 'Learning system updated successfully'
			})
		},
		onError: handleApiError
	})

	const addSubjectMutation = useMutation({
		mutationFn: ({ systemId, name }: { systemId: string; name: string }) =>
			api.addSubject(systemId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setNewSubjectName('')
			toast({
				title: 'Success',
				description: 'Subject added successfully'
			})
		},
		onError: handleApiError
	})

	const removeSubjectMutation = useMutation({
		mutationFn: ({ systemId, subjectId }: { systemId: string; subjectId: string }) =>
			api.removeSubject(systemId, subjectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			toast({
				title: 'Success',
				description: 'Subject removed successfully'
			})
		},
		onError: handleApiError
	})

	const updateSubjectMutation = useMutation({
		mutationFn: ({
			systemId,
			subjectId,
			name
		}: {
			systemId: string
			subjectId: string
			name: string
		}) => api.updateSubject(systemId, subjectId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setEditingSubjectId(null)
			toast({
				title: 'Success',
				variant: 'success',
				description: 'Subject updated successfully'
			})
		},
		onError: handleApiError
	})

	const addQualificationMutation = useMutation({
		mutationFn: ({ subjectId, name }: { subjectId: string; name: string }) =>
			api.addQualification(subjectId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setNewQualificationName('')
			toast({
				title: 'Success',
				description: 'Qualification added successfully'
			})
		},
		onError: handleApiError
	})

	const removeQualificationMutation = useMutation({
		mutationFn: ({ subjectId, qualificationId }: { subjectId: string; qualificationId: string }) =>
			api.removeQualification(subjectId, qualificationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			toast({
				title: 'Success',
				description: 'Qualification removed successfully'
			})
		},
		onError: handleApiError
	})

	const updateQualificationMutation = useMutation({
		mutationFn: ({
			subjectId,
			qualificationId,
			name
		}: {
			subjectId: string
			qualificationId: string
			name: string
		}) => api.updateQualification(subjectId, qualificationId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['learningSystems'] })
			setEditingQualificationId(null)
			toast({
				title: 'Success',
				variant: 'success',
				description: 'Qualification updated successfully'
			})
		},
		onError: handleApiError
	})

	const handleEditSystem = (system: LearningSystem) => {
		setEditingSystemId(system.id)
		setEditingSystemName(system.name)
	}

	const handleCancelEditSystem = () => {
		setEditingSystemId(null)
		setEditingSystemName('')
	}

	const handleUpdateSystem = () => {
		if (editingSystemId && editingSystemName.trim() !== '') {
			updateSystemMutation.mutate({ id: editingSystemId, name: editingSystemName })
		}
	}

	const handleEditSubject = (subject: Subject) => {
		setEditingSubjectId(subject.id)
		setEditingSubjectName(subject.name)
	}

	const handleCancelEditSubject = () => {
		setEditingSubjectId(null)
		setEditingSubjectName('')
	}

	const handleUpdateSubject = () => {
		if (selectedSystemId && editingSubjectId && editingSubjectName.trim() !== '') {
			updateSubjectMutation.mutate({
				systemId: selectedSystemId,
				subjectId: editingSubjectId,
				name: editingSubjectName
			})
		}
	}

	const handleEditQualification = (qualification: Qualification) => {
		setEditingQualificationId(qualification.id)
		setEditingQualificationName(qualification.name)
	}

	const handleCancelEditQualification = () => {
		setEditingQualificationId(null)
		setEditingQualificationName('')
	}

	const handleUpdateQualification = () => {
		if (selectedSubjectId && editingQualificationId && editingQualificationName.trim() !== '') {
			updateQualificationMutation.mutate({
				subjectId: selectedSubjectId,
				qualificationId: editingQualificationId,
				name: editingQualificationName
			})
		}
	}

	const handleDelete = () => {
		if (itemToDelete) {
			switch (itemToDelete.type) {
				case 'learning system':
					deleteSystemMutation.mutate(itemToDelete.id)
					break
				case 'subject':
					if (selectedSystemId) {
						removeSubjectMutation.mutate({ systemId: selectedSystemId, subjectId: itemToDelete.id })
					}
					break
				case 'qualification':
					if (selectedSubjectId) {
						removeQualificationMutation.mutate({
							subjectId: selectedSubjectId,
							qualificationId: itemToDelete.id
						})
					}
					break
			}
		}
		setDeleteDialogOpen(false)
		setItemToDelete(null)
	}

	const totalSubjects = learningSystems.reduce((acc, system) => acc + system.subjects.length, 0)
	const totalQualifications = learningSystems.reduce(
		(acc, system) =>
			acc + system.subjects.reduce((subAcc, subject) => subAcc + subject.qualifications.length, 0),
		0
	)

	return (
		<>
			<div className="grid gri d-cols-1 md:grid-cols-3 gap-6 mb-6">
				<SummaryCards
					systemsCount={learningSystems.length}
					subjectsCount={totalSubjects}
					qualificationsCount={totalQualifications}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="col-span-1 md:col-span-3 lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-xl">Learning Systems</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex space-x-2">
								<Input
									type="text"
									value={newSystemName}
									onChange={(e) => setNewSystemName(e.target.value)}
									placeholder="New system name"
									className="flex-grow"
								/>
								<Button onClick={() => createSystemMutation.mutate(newSystemName)}>
									<Plus className="mr-2 h-4 w-4" /> Add
								</Button>
							</div>
							<div className="flex space-x-2">
								<Input
									type="text"
									value={searchSystem}
									onChange={(e) => setSearchSystem(e.target.value)}
									placeholder="Search systems"
									className="flex-grow"
								/>
								<Button variant="outline">
									<Search className="h-4 w-4" />
								</Button>
							</div>
							<ScrollArea className="h-[300px] pr-4">
								{filteredSystems.map((system) => (
									<React.Fragment key={system.id}>
										<div className="flex items-center py-2">
											{editingSystemId === system.id ? (
												<>
													<Input
														type="text"
														value={editingSystemName}
														onChange={(e) => setEditingSystemName(e.target.value)}
														className="flex-grow mr-2"
													/>
													<Button
														onClick={handleUpdateSystem}
														variant="outline"
														size="icon"
														className="mr-1"
													>
														<Check className="h-4 w-4" />
													</Button>
													<Button onClick={handleCancelEditSystem} variant="outline" size="icon">
														<X className="h-4 w-4" />
													</Button>
												</>
											) : (
												<>
													<Button
														onClick={() => setSelectedSystemId(system.id)}
														variant={selectedSystemId === system.id ? 'secondary' : 'outline'}
														className="flex-grow mr-2 justify-start"
													>
														{system.name}
														{selectedSystemId === system.id && (
															<ChevronRight className="ml-auto h-4 w-4" />
														)}
													</Button>
													<Button
														onClick={() => handleEditSystem(system)}
														variant="outline"
														size="icon"
														className="mr-1"
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														onClick={() => {
															setItemToDelete({ type: 'learning system', id: system.id })
															setDeleteDialogOpen(true)
														}}
														variant="destructive"
														size="icon"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</>
											)}
										</div>
										<Separator className="my-2" />
									</React.Fragment>
								))}
							</ScrollArea>
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-1 md:col-span-3 lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-xl">Subjects</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedSystemId ? (
							<div className="space-y-4">
								<div className="flex space-x-2">
									<Input
										type="text"
										value={newSubjectName}
										onChange={(e) => setNewSubjectName(e.target.value)}
										placeholder="New subject name"
										className="flex-grow"
									/>
									<Button
										onClick={() =>
											addSubjectMutation.mutate({
												systemId: selectedSystemId,
												name: newSubjectName
											})
										}
									>
										<Plus className="mr-2 h-4 w-4" /> Add
									</Button>
								</div>
								<div className="flex space-x-2">
									<Input
										type="text"
										value={searchSubject}
										onChange={(e) => setSearchSubject(e.target.value)}
										placeholder="Search subjects"
										className="flex-grow"
									/>
									<Button variant="outline">
										<Search className="h-4 w-4" />
									</Button>
								</div>
								<ScrollArea className="h-[300px] pr-4">
									{filteredSubjects.map((subject) => (
										<React.Fragment key={subject.id}>
											<div className="flex items-center py-2">
												{editingSubjectId === subject.id ? (
													<>
														<Input
															type="text"
															value={editingSubjectName}
															onChange={(e) => setEditingSubjectName(e.target.value)}
															className="flex-grow mr-2"
														/>
														<Button
															onClick={handleUpdateSubject}
															variant="outline"
															size="icon"
															className="mr-1"
														>
															<Check className="h-4 w-4" />
														</Button>
														<Button onClick={handleCancelEditSubject} variant="outline" size="icon">
															<X className="h-4 w-4" />
														</Button>
													</>
												) : (
													<>
														<Button
															onClick={() => setSelectedSubjectId(subject.id)}
															variant={selectedSubjectId === subject.id ? 'secondary' : 'outline'}
															className="flex-grow mr-2 justify-start"
														>
															{subject.name}
															{selectedSubjectId === subject.id && (
																<ChevronRight className="ml-auto h-4 w-4" />
															)}
														</Button>
														<Button
															onClick={() => handleEditSubject(subject)}
															variant="outline"
															size="icon"
															className="mr-1"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															onClick={() => {
																setItemToDelete({ type: 'subject', id: subject.id })
																setDeleteDialogOpen(true)
															}}
															variant="destructive"
															size="icon"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</>
												)}
											</div>
											<Separator className="my-2" />
										</React.Fragment>
									))}
								</ScrollArea>
							</div>
						) : (
							<p className="text-muted-foreground">Select a learning system to view subjects</p>
						)}
					</CardContent>
				</Card>

				<Card className="col-span-1 md:col-span-3 lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-xl">Qualifications</CardTitle>
					</CardHeader>
					<CardContent>
						{selectedSubjectId ? (
							<div className="space-y-4">
								<div className="flex space-x-2">
									<Input
										type="text"
										value={newQualificationName}
										onChange={(e) => setNewQualificationName(e.target.value)}
										placeholder="New qualification name"
										className="flex-grow"
									/>
									<Button
										onClick={() =>
											addQualificationMutation.mutate({
												subjectId: selectedSubjectId,
												name: newQualificationName
											})
										}
									>
										<Plus className="mr-2 h-4 w-4" /> Add
									</Button>
								</div>
								<div className="flex space-x-2">
									<Input
										type="text"
										value={searchQualification}
										onChange={(e) => setSearchQualification(e.target.value)}
										placeholder="Search qualifications"
										className="flex-grow"
									/>
									<Button variant="outline">
										<Search className="h-4 w-4" />
									</Button>
								</div>
								<ScrollArea className="h-[300px] pr-4">
									{filteredQualifications.map((qualification) => (
										<React.Fragment key={qualification.id}>
											<div className="flex items-center py-2">
												{editingQualificationId === qualification.id ? (
													<>
														<Input
															type="text"
															value={editingQualificationName}
															onChange={(e) => setEditingQualificationName(e.target.value)}
															className="flex-grow mr-2"
														/>
														<Button
															onClick={handleUpdateQualification}
															variant="outline"
															size="icon"
															className="mr-1"
														>
															<Check className="h-4 w-4" />
														</Button>
														<Button
															onClick={handleCancelEditQualification}
															variant="outline"
															size="icon"
														>
															<X className="h-4 w-4" />
														</Button>
													</>
												) : (
													<>
														<span className="flex-grow">{qualification.name}</span>
														<Button
															onClick={() => handleEditQualification(qualification)}
															variant="outline"
															size="icon"
															className="mr-1"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															onClick={() => {
																setItemToDelete({ type: 'qualification', id: qualification.id })
																setDeleteDialogOpen(true)
															}}
															variant="destructive"
															size="icon"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</>
												)}
											</div>
											<Separator className="my-2" />
										</React.Fragment>
									))}
								</ScrollArea>
							</div>
						) : (
							<p className="text-muted-foreground">Select a subject to view qualifications</p>
						)}
					</CardContent>
				</Card>
			</div>

			<DeleteConfirmationDialog
				isOpen={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				onConfirm={handleDelete}
				itemType={itemToDelete?.type}
			/>
		</>
	)
}

export default LearningSystemApp
