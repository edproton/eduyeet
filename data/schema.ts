import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userLogins = pgTable("user_logins", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
  revokedReason: varchar("revoked_reason", { length: 255 }),
  revokedByIp: varchar("revoked_by_ip", { length: 45 }),
  revokedBy: uuid("revoked_by"),
});

export const userLoginsRelations = relations(userLogins, ({ one }) => ({
  user: one(users, {
    fields: [userLogins.userId],
    references: [users.id],
  }),
}));

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const UserTypeEnum = pgEnum("user_type", ["student", "tutor"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  type: UserTypeEnum("type").notNull().default("student"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const systems = pgTable("systems", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  systemId: integer("system_id")
    .notNull()
    .references(() => systems.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qualifications = pgTable("qualifications", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => subjects.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemRelations = relations(systems, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectRelations = relations(subjects, ({ one, many }) => ({
  system: one(systems, {
    fields: [subjects.systemId],
    references: [systems.id],
  }),
  qualifications: many(qualifications),
}));

export const qualificationRelations = relations(qualifications, ({ one }) => ({
  subject: one(subjects, {
    fields: [qualifications.subjectId],
    references: [subjects.id],
  }),
}));
