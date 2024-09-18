'use server'

import { db } from '@/data/db'
import { userLogins, users } from '@/data/schema'
import { count, eq, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'

// Mock database
const _users = [
	{ id: 1, email: 'john@example.com', name: 'John Doe' },
	{ id: 2, email: 'jane@example.com', name: 'Jane Smith' },
	{ id: 3, email: 'bob@example.com', name: 'Bob Johnson' },
	{ id: 4, email: 'alice@example.com', name: 'Alice Williams' },
	{ id: 5, email: 'charlie@example.com', name: 'Charlie Brown' }
]

const FilterSchema = z.object({
	id: z.string().optional(),
	email: z.string().optional(),
	name: z.string().optional(),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export async function fetchUsers(prevState: any, formData: FormData) {
	const { id, email, name, sortBy, sortOrder } = FilterSchema.parse({
		id: formData.get('id'),
		email: formData.get('email'),
		name: formData.get('name'),
		sortBy: formData.get('sortBy'),
		sortOrder: formData.get('sortOrder')
	})

	// Simulate a delay to show loading state
	await new Promise((resolve) => setTimeout(resolve, 500))

	let filteredUsers = _users.filter(
		(user) =>
			(!id || user.id.toString().includes(id)) &&
			(!email || user.email.toLowerCase().includes(email.toLowerCase())) &&
			(!name || user.name.toLowerCase().includes(name.toLowerCase()))
	)

	if (sortBy) {
		filteredUsers.sort((a, b) => {
			if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1
			if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1
			return 0
		})
	}

	return { users: filteredUsers }
}

export type User = {
	id: number
	name: string
	type: string
}

export async function getUsers() {
	const usersData = await db
		.select({
			id: users.id,
			name: users.name,
			type: users.type
		})
		.from(users)

	return { users: usersData }
}

export async function getSummaryData() {
	const [totalUsers, activeSessions] = await Promise.all([
		db.select({ count: count() }).from(users),
		db
			.select({ count: count() })
			.from(users)
			.innerJoin(userLogins, eq(users.id, userLogins.userId))
			.where(isNull(userLogins.revokedAt))
	])

	return {
		totalUsers: totalUsers[0].count,
		activeSessions: activeSessions[0].count
	}
}
