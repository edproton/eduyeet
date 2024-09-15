import { eq } from "drizzle-orm";
import { users, userRoles } from "../schema";
import { db } from "../db";

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
  type?: string;
  agreeToTerms?: boolean;
}

interface UpdateUserParams {
  name?: string;
  email?: string;
  password?: string;
  type?: string;
  agreeToTerms?: boolean;
}

export class UserRepository {
  /**
   * Creates a new user.
   * @param params - The user details.
   * @returns The created user.
   */
  static async createUser(params: CreateUserParams) {
    const [user] = await db
      .insert(users)
      .values({
        name: params.name,
        email: params.email,
        password: params.password, // Note: Ensure password is hashed before passing to this method
        type: params.type || "student",
        agreeToTerms: params.agreeToTerms || false,
      })
      .returning();

    return user;
  }

  /**
   * Updates an existing user.
   * @param id - The ID of the user to update.
   * @param params - The user details to update.
   * @returns The updated user.
   */
  static async updateUser(id: number, params: UpdateUserParams) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  /**
   * Deletes a user.
   * @param id - The ID of the user to delete.
   * @returns The deleted user.
   */
  static async deleteUser(id: number) {
    // First, delete associated user roles
    await db.delete(userRoles).where(eq(userRoles.userId, id));

    // Then, delete the user
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return deletedUser;
  }

  /**
   * Retrieves all users.
   * @returns An array of all users.
   */
  static async getAllUsers() {
    return db.select().from(users);
  }

  /**
   * Retrieves a user by ID.
   * @param id - The ID of the user to retrieve.
   * @returns The user with the specified ID, or null if not found.
   */
  static async getUserById(id: number) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  /**
   * Retrieves a user by email.
   * @param email - The email of the user to retrieve.
   * @returns The user with the specified email, or null if not found.
   */
  static async getUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }
}
