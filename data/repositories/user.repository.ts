import { eq, ilike, sql } from "drizzle-orm";
import { db } from "../db"; // Assuming you have a db connection setup
import { users } from "../schema";

interface GetAllUsersOptions {
  skip?: number;
  take?: number;
}

export type User = typeof users.$inferSelect;

export const UsersRepository = {
  // Insert a new user
  async insert(
    data: Omit<typeof users.$inferInsert, "id" | "createdAt" | "updatedAt">
  ) {
    const [insertedUser] = await db
      .insert(users)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return insertedUser;
  },

  // Update a user
  async update(
    id: number,
    data: Partial<Omit<typeof users.$inferInsert, "id" | "createdAt">>
  ) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  },

  // Delete a user
  async delete(id: number) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deletedUser;
  },

  // Get a user by ID
  async getById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  // Get a user by email
  async getByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  // Get all users
  async getAll({ skip = 0, take }: GetAllUsersOptions = {}) {
    const query = db.select().from(users);

    if (typeof skip === "number") {
      query.offset(skip);
    }

    if (typeof take === "number") {
      query.limit(take);
    }

    return query;
  },

  // Get users by type
  async getByType(type: string) {
    return db.select().from(users).where(eq(users.type, type));
  },

  // Search users by name (case-insensitive)
  async searchByName(name: string) {
    return db
      .select()
      .from(users)
      .where(ilike(users.name, `%${name}%`));
  },

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.email, email));
    return result.count > 0;
  },
};

export default UsersRepository;
