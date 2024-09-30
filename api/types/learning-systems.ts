export interface LearningSystem {
	id: string
	name: string
	subjects: Subject[]
}

export interface Subject {
	id: string
	name: string
	qualifications: Qualification[]
}

export interface Qualification {
	id: string
	name: string
}
