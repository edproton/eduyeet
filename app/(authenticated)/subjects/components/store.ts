import { create } from 'zustand'

interface StoreState {
	selectedSystemId: string | null
	selectedSubjectId: string | null
	newSystemName: string
	newSubjectName: string
	newQualificationName: string
	editingSystemId: string | null
	editingSystemName: string
	editingSubjectId: string | null
	editingSubjectName: string
	editingQualificationId: string | null
	editingQualificationName: string
	searchSystem: string
	searchSubject: string
	searchQualification: string
	deleteDialogOpen: boolean
	itemToDelete: { type: 'learning system' | 'subject' | 'qualification'; id: string } | null
	setSelectedSystemId: (id: string | null) => void
	setSelectedSubjectId: (id: string | null) => void
	setNewSystemName: (name: string) => void
	setNewSubjectName: (name: string) => void
	setNewQualificationName: (name: string) => void
	setEditingSystemId: (id: string | null) => void
	setEditingSystemName: (name: string) => void
	setEditingSubjectId: (id: string | null) => void
	setEditingSubjectName: (name: string) => void
	setEditingQualificationId: (id: string | null) => void
	setEditingQualificationName: (name: string) => void
	setSearchSystem: (search: string) => void
	setSearchSubject: (search: string) => void
	setSearchQualification: (search: string) => void
	setDeleteDialogOpen: (open: boolean) => void
	setItemToDelete: (
		item: { type: 'learning system' | 'subject' | 'qualification'; id: string } | null
	) => void
}

export const createStore = () =>
	create<StoreState>((set) => ({
		selectedSystemId: null,
		selectedSubjectId: null,
		newSystemName: '',
		newSubjectName: '',
		newQualificationName: '',
		editingSystemId: null,
		editingSystemName: '',
		editingSubjectId: null,
		editingSubjectName: '',
		editingQualificationId: null,
		editingQualificationName: '',
		searchSystem: '',
		searchSubject: '',
		searchQualification: '',
		deleteDialogOpen: false,
		itemToDelete: null,
		setSelectedSystemId: (id) => set({ selectedSystemId: id, selectedSubjectId: null }),
		setSelectedSubjectId: (id) => set({ selectedSubjectId: id }),
		setNewSystemName: (name) => set({ newSystemName: name }),
		setNewSubjectName: (name) => set({ newSubjectName: name }),
		setNewQualificationName: (name) => set({ newQualificationName: name }),
		setEditingSystemId: (id) => set({ editingSystemId: id }),
		setEditingSystemName: (name) => set({ editingSystemName: name }),
		setEditingSubjectId: (id) => set({ editingSubjectId: id }),
		setEditingSubjectName: (name) => set({ editingSubjectName: name }),
		setEditingQualificationId: (id) => set({ editingQualificationId: id }),
		setEditingQualificationName: (name) => set({ editingQualificationName: name }),
		setSearchSystem: (search) => set({ searchSystem: search }),
		setSearchSubject: (search) => set({ searchSubject: search }),
		setSearchQualification: (search) => set({ searchQualification: search }),
		setDeleteDialogOpen: (open) => set({ deleteDialogOpen: open }),
		setItemToDelete: (item) => set({ itemToDelete: item })
	}))
