import { users } from '@/data/schemas/users'
import { verifications } from '@/data/schemas'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'
import { db } from '@/data/db'

export interface VerificationData {
	userId: number
	verificationCode: string
	verificationExpires: Date
}

export const VerificationRepository = {
	async createVerification(userId: number): Promise<VerificationData> {
		const verificationCode = uuidv4()
		const verificationExpires = addHours(new Date(), 24)

		await db.insert(verifications).values({
			userId,
			verificationCode,
			verificationExpires
		})

		return {
			userId,
			verificationCode,
			verificationExpires
		}
	},

	async getVerification(userId: number): Promise<VerificationData | null> {
		const result = await db
			.select({
				userId: verifications.userId,
				verificationCode: verifications.verificationCode,
				verificationExpires: verifications.verificationExpires
			})
			.from(verifications)
			.where(eq(verifications.userId, userId))
			.limit(1)

		return result[0] || null
	},

	async verifyUser(userId: number, verificationCode: string): Promise<boolean> {
		const result = await db.transaction(async (tx) => {
			const updateResult = await tx
				.update(users)
				.set({ isVerified: true })
				.where(eq(users.id, userId))

			await tx
				.delete(verifications)
				.where(
					and(
						eq(verifications.userId, userId),
						eq(verifications.verificationCode, verificationCode)
					)
				)

			return (updateResult.rowCount ?? 0) > 0
		})

		return result
	},

	async clearVerification(userId: number): Promise<void> {
		await db.delete(verifications).where(eq(verifications.userId, userId))
	}
}
