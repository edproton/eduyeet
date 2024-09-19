import { pgTable, serial, varchar, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { userRoles } from './userRoles'
import { userLogins } from './userLogins'

export const userTypeEnum = pgEnum('user_type', ['tutor', 'student'])

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	type: userTypeEnum('type').notNull(),
	isVerified: boolean('is_verified').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
	userRoles: many(userRoles),
	userLogins: many(userLogins)
}))
