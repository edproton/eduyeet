import { eq } from 'drizzle-orm'
import { db } from '@/data/db'
import { users, userTypeEnum } from '@/data/schemas'

interface GetAllUsersOptions {
	skip?: number
	take?: number
}

export const UsersRepository = {
	async insert(data: UserInsert): Promise<User> {
		const [insertedUser] = await db
			.insert(users)
			.values({
				...data,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			.returning()

		return insertedUser
	},

	async update(id: number, data: UserInsert): Promise<User> {
		const [updatedUser] = await db
			.update(users)
			.set({
				...data,
				updatedAt: new Date()
			})
			.where(eq(users.id, id))
			.returning()

		return updatedUser
	},

	async updateIsVerified(id: number, isVerified: boolean): Promise<User> {
		const [updatedUser] = await db
			.update(users)
			.set({
				isVerified,
				updatedAt: new Date()
			})
			.where(eq(users.id, id))
			.returning()

		return updatedUser
	},

	async getById(id: number): Promise<User> {
		const [user] = await db.select().from(users).where(eq(users.id, id))

		return user
	},

	async getByEmail(email: string): Promise<User> {
		const [user] = await db.select().from(users).where(eq(users.email, email))

		return user
	},

	async getAll({ skip = 0, take }: GetAllUsersOptions = {}): Promise<User[]> {
		const query = db.select().from(users)

		if (typeof skip === 'number') {
			query.offset(skip)
		}

		if (typeof take === 'number') {
			query.limit(take)
		}

		return query
	}
}

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert
export type UserType = (typeof userTypeEnum.enumValues)[number]

export default UsersRepository
