'use server'

import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { db } from '@/data/db'
import { subjects, systems, qualifications } from '@/data/schemas'

export interface Qualification {
	name: string
	tutors: number
	students: number
}

export interface Subject {
	name: string
	tutors: number
	students: number
	qualifications: Qualification[]
}

export interface System {
	name: string
	tutors: number
	students: number
	subjects: Subject[]
}

export const getSystems = cache(async (): Promise<System[]> => {
	try {
		const systemsData = await db
			.select({
				id: systems.id,
				name: systems.name
			})
			.from(systems)

		const systemsWithSubjects = await Promise.all(
			systemsData.map(async (system) => {
				const subjectsData = await db
					.select({
						id: subjects.id,
						name: subjects.name
					})
					.from(subjects)
					.where(eq(subjects.systemId, system.id))

				const subjectsWithQualifications = await Promise.all(
					subjectsData.map(async (subject) => {
						const qualificationsData = await db
							.select({
								name: qualifications.name
							})
							.from(qualifications)
							.where(eq(qualifications.subjectId, subject.id))

						const qualificationsWithCounts: Qualification[] = qualificationsData.map((qual) => ({
							name: qual.name,
							tutors: 0,
							students: 0
						}))

						return {
							name: subject.name,
							tutors: 0,
							students: 0,
							qualifications: qualificationsWithCounts
						}
					})
				)

				return {
					name: system.name,
					tutors: 0,
					students: 0,
					subjects: subjectsWithQualifications
				}
			})
		)

		return systemsWithSubjects
	} catch (error) {
		console.error('Error fetching systems:', error)
		throw new Error('Failed to fetch systems')
	}
})
