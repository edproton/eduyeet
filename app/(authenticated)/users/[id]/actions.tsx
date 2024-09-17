"use server";

import { db } from "@/data/db";
import { userLogins, users } from "@/data/schema";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { decodeJwt } from "jose";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function getUser(id: number) {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result[0] || null;
}

export async function getUserSessions(userId: number) {
  const userLoginStats = await db
    .select({
      activeSessions: sql<number>`SUM(CASE WHEN ${userLogins.revokedAt} IS NULL THEN 1 ELSE 0 END)`,
      revokedSessions: sql<number>`SUM(CASE WHEN ${userLogins.revokedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      lastLogin: sql<Date>`MAX(${userLogins.lastUsed})`,
      totalSessions: sql<number>`COUNT(${userLogins.id})`,
    })
    .from(userLogins)
    .where(eq(userLogins.userId, userId));

  const lastUsedDevice = await db
    .select({
      userAgent: userLogins.userAgent,
    })
    .from(userLogins)
    .where(eq(userLogins.userId, userId))
    .orderBy(desc(userLogins.lastUsed))
    .limit(1);

  const result = userLoginStats[0];
  const lastDevice = lastUsedDevice[0];

  const parser = new UAParser(lastDevice.userAgent!);

  return {
    activeSessions: result.activeSessions,
    lastLogin: result.lastLogin,
    revokedSessions: result.revokedSessions,
    totalSessions: result.totalSessions,
    lastUsedDevice: `${parser.getOS().name} ${parser.getOS().version}`,
  };
}

export async function revokeSession(sessionId: string, reason: string) {
  try {
    await db
      .update(userLogins)
      .set({
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(userLogins.id, sessionId));

    revalidatePath("/app/(authenticated)/users/[id]");

    return { success: true };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return { success: false, error: "Failed to revoke session" };
  }
}
export async function getUserLogins(userId: number) {
  const cookiesList = cookies();
  const accessToken = cookiesList.get("accessToken")?.value;

  const token = decodeJwt(accessToken!);

  const activeLogins = await db
    .select()
    .from(userLogins)
    .where(and(eq(userLogins.userId, userId), isNull(userLogins.revokedAt)))
    .orderBy(desc(userLogins.lastUsed));

  return {
    sessions: activeLogins.map((l) => {
      const parser = new UAParser(l.userAgent!);

      return {
        ...l,
        isCurrent: l.id === token.jti,
        device: `${parser.getOS().name} ${parser.getOS().version}`,
      };
    }),
  };
}

export async function deleteUser(userId: number) {
  try {
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/app/(authenticated)/users");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}
