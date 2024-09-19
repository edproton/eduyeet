import { pgTable, serial, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { userRoles } from './userRoles'
import { userLogins } from './userLogins'

export const UserTypeEnum = pgEnum('user_type', ['student', 'tutor'])

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	password: varchar('password', { length: 255 }).notNull(),
	type: UserTypeEnum('type').notNull().default('student'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
	userRoles: many(userRoles),
	userLogins: many(userLogins)
}))
