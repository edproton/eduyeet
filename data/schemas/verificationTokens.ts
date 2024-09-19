import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '.'
import { relations } from 'drizzle-orm'

export const verificationTokens = pgTable('verification_tokens', {
	id: serial('id').primaryKey(),
	userId: serial('user_id').references(() => users.id),
	token: text('token').notNull(),
	expiresAt: timestamp('expires_at').notNull()
})

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
	user: one(users, {
		fields: [verificationTokens.userId],
		references: [users.id]
	})
}))
