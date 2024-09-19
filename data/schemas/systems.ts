import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { subjects } from './subjects'

export const systems = pgTable('systems', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const systemRelations = relations(systems, ({ many }) => ({
	subjects: many(subjects)
}))
