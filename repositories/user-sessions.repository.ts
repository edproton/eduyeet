import { eq } from 'drizzle-orm'
import { db } from '@/data/db'
import { userLogins } from '@/data/schemas'

export class UserLoginsRepository {
	static async insert(data: UserLoginInsert): Promise<UserLogin> {
		const [insertedLogin] = await db.insert(userLogins).values(data).returning()

		return insertedLogin
	}

	static async update(data: UserLoginUpdate): Promise<UserLogin> {
		const [updatedLogin] = await db
			.update(userLogins)
			.set(data)
			.where(eq(userLogins.id, data.id))
			.returning()

		return updatedLogin
	}

	static async getById(id: string): Promise<UserLogin> {
		const [login] = await db.select().from(userLogins).where(eq(userLogins.id, id))

		return login
	}
}

export type UserLogin = typeof userLogins.$inferSelect
export type UserLoginUpdate = {
	id: string
	revokedAt: Date
	revokedBy: string | null
	revokedByIp: string
	revokedReason: string
}
export type UserLoginInsert = typeof userLogins.$inferInsert

export default UserLoginsRepository
