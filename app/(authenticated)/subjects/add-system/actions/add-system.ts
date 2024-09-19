'use server'

import { db } from '@/data/db'
import { qualifications, subjects, systems } from '@/data/schemas'
import { z } from 'zod'

const QualificationSchema = z.object({
	name: z.string().min(1, 'Qualification name is required')
})

const SubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	qualifications: z.array(QualificationSchema).min(1, 'At least one qualification is required')
})

const SystemSchema = z.object({
	name: z.string().min(1, 'System name is required'),
	subjects: z.array(SubjectSchema).min(1, 'At least one subject is required')
})

export type SystemFormData = z.infer<typeof SystemSchema>

export async function addSystem(data: SystemFormData) {
	const result = SystemSchema.safeParse(data)

	if (!result.success) {
		return { success: false, errors: result.error.flatten().fieldErrors }
	}

	try {
		await db.transaction(async (tx) => {
			// Insert the system
			const [system] = await tx
				.insert(systems)
				.values({
					name: result.data.name
				})
				.returning()

			// Insert subjects and qualifications
			for (const subject of result.data.subjects) {
				const [insertedSubject] = await tx
					.insert(subjects)
					.values({
						name: subject.name,
						systemId: system.id
					})
					.returning()

				await tx.insert(qualifications).values(
					subject.qualifications.map((qual) => ({
						name: qual.name,
						subjectId: insertedSubject.id
					}))
				)
			}
		})

		return { success: true, message: 'System added successfully' }
	} catch (error) {
		console.error('Error adding system:', error)
		return {
			success: false,
			message: 'Failed to add system. Please try again.'
		}
	}
}
