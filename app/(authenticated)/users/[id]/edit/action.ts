'use server'

import { db } from '@/data/db'
import { users } from '@/data/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
	try {
		await db.update(users).set(data).where(eq(users.id, id))
		revalidatePath(`/users/${id}`)

		return { success: true }
	} catch (error) {
		console.error('Failed to update user:', error)
		return { success: false, error: 'Failed to update user' }
	}
}
