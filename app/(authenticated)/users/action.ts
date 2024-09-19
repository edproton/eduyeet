'use server'

import { db } from '@/data/db'
import { UsersRepository } from '@/repositories'
import { userLogins, users } from '@/data/schemas'
import { count, eq, isNull } from 'drizzle-orm'

export async function getUsers() {
	const usersData = await UsersRepository.getAll()

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
