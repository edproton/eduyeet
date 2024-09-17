import { eq } from "drizzle-orm";
import { db } from "../db";
import { userLogins } from "../schema";

export type UserLogin = typeof userLogins.$inferSelect;

export class UserLoginsRepository {
  static async insert(
    data: Omit<typeof userLogins.$inferInsert, "id" | "issuedAt" | "lastUsed">
  ) {
    const [insertedLogin] = await db
      .insert(userLogins)
      .values(data)
      .returning();
    return insertedLogin;
  }

  static async update(
    id: string,
    data: Partial<Omit<typeof userLogins.$inferInsert, "id">>
  ) {
    const [updatedLogin] = await db
      .update(userLogins)
      .set(data)
      .where(eq(userLogins.id, id))
      .returning();
    return updatedLogin;
  }

  static async getById(id: string) {
    const [login] = await db
      .select()
      .from(userLogins)
      .where(eq(userLogins.id, id));
    return login;
  }
}

export default UserLoginsRepository;
