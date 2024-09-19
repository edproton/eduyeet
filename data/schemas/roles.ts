import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { userRoles } from './userRoles'

export const roles = pgTable('roles', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	description: varchar('description', { length: 255 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles)
}))
