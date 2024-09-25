import { create } from 'zustand'

interface TutorConfigurationStore {
	selectedSystems: string[]
	selectedSubjects: string[]
	selectedQualifications: string[]
	step: number
	setSelectedSystems: (systems: string[]) => void
	setSelectedSubjects: (subjects: string[]) => void
	setSelectedQualifications: (qualifications: string[]) => void
	setStep: (step: number) => void
}

export const useTutorConfigurationStore = create<TutorConfigurationStore>((set) => ({
	selectedSystems: [],
	selectedSubjects: [],
	selectedQualifications: [],
	step: 1,
	setSelectedSystems: (systems) => set({ selectedSystems: systems }),
	setSelectedSubjects: (subjects) => set({ selectedSubjects: subjects }),
	setSelectedQualifications: (qualifications) => set({ selectedQualifications: qualifications }),
	setStep: (step) => set({ step })
}))
