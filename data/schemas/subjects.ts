import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { systems } from './systems'
import { qualifications } from './qualifications'

export const subjects = pgTable('subjects', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	systemId: integer('system_id')
		.notNull()
		.references(() => systems.id),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const subjectRelations = relations(subjects, ({ one, many }) => ({
	system: one(systems, {
		fields: [subjects.systemId],
		references: [systems.id]
	}),
	qualifications: many(qualifications)
}))
