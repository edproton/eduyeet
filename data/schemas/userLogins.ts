import { pgTable, uuid, integer, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'

export const userLogins = pgTable('user_logins', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	ipAddress: varchar('ip_address', { length: 45 }).notNull(),
	userAgent: text('user_agent').notNull(),
	lastUsed: timestamp('last_used').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	issuedAt: timestamp('issued_at').defaultNow(),
	revokedAt: timestamp('revoked_at'),
	revokedReason: varchar('revoked_reason', { length: 255 }),
	revokedByIp: varchar('revoked_by_ip', { length: 45 }),
	revokedBy: uuid('revoked_by')
})

export const userLoginsRelations = relations(userLogins, ({ one }) => ({
	user: one(users, {
		fields: [userLogins.userId],
		references: [users.id]
	})
}))
