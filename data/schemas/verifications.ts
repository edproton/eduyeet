import { pgTable, integer, varchar, timestamp, serial } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const verifications = pgTable('verifications', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	verificationCode: varchar('verification_code', { length: 36 }).notNull(),
	verificationExpires: timestamp('verification_expires').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
})

export const verificationsRelations = relations(verifications, ({ one }) => ({
	user: one(users, {
		fields: [verifications.userId],
		references: [users.id]
	})
}))
