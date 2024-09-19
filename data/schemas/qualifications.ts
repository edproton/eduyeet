import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { subjects } from './subjects'

export const qualifications = pgTable('qualifications', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	subjectId: integer('subject_id')
		.notNull()
		.references(() => subjects.id),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const qualificationRelations = relations(qualifications, ({ one }) => ({
	subject: one(subjects, {
		fields: [qualifications.subjectId],
		references: [subjects.id]
	})
}))
