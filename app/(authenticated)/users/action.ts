'use server'

import { db } from '@/data/db'
import { users } from '@/data/schema'
import { sql } from 'drizzle-orm'

export type User = {
	id: number
	name: string
	type: string
}

type CountResult = {
	count: number
}

export async function getUsers(
	page: number = 1,
	pageSize: number = 10
): Promise<{ users: User[]; totalPages: number }> {
	const offset = (page - 1) * pageSize

	const [usersData, totalCountResult] = await Promise.all([
		db
			.select({
				id: users.id,
				name: users.name,
				type: users.type
			})
			.from(users)
			.limit(pageSize)
			.offset(offset),
		db.select({ count: sql<number>`cast(count(*) as integer)` }).from(users)
	])

	const totalCount = (totalCountResult[0] as CountResult).count
	const totalPages = Math.ceil(totalCount / pageSize)

	return { users: usersData, totalPages }
}
