"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/data/db";
import { users } from "@/data/schema";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { AuthService } from "@/services/auth-service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  type: z.enum(["student", "tutor"]),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the EduYeet guidelines.",
  }),
});

export type ActionResult = {
  error?: string;
  success?: string;
} | null;

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "true",
  });

  if (!validatedFields.success) {
    return { error: "Invalid email or password" };
  }

  const { email, password, remember } = validatedFields.data;

  try {
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "Unknown";
    const forwardedFor = headersList.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    const deviceInfo = {
      userAgent,
      ipAddress,
    };

    const { refreshToken, accessToken, user } = await AuthService.login(
      email,
      password,
      ipAddress,
      userAgent,
      deviceInfo
    );

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: remember ? 7 * 24 * 60 * 60 : undefined, // 7 days if remember is true
    };

    cookies().set("refreshToken", refreshToken, cookieOptions);
    cookies().set("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    });

    // You might want to set user info in the session or return it to the client
    // For example:
    // session.set('user', { id: user.id, name: user.name, email: user.email, type: user.type });

    return { success: "Logged in successfully" };
  } catch (error) {
    console.error("Login error:", error);
    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return { error: "Invalid email or password" };
    }
    return { error: "An error occurred during login" };
  }
}

export async function registerAction(
  formData: FormData
): Promise<ActionResult> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    type: formData.get("type"),
    agreeToTerms: formData.get("agreeToTerms") === "true",
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password, type, agreeToTerms } = validatedFields.data;

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "Email already in use" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        type,
        agreeToTerms,
      })
      .returning();

    console.log("New user registered:", newUser[0].id);

    return { success: "Registered successfully" };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An error occurred during registration" };
  }
}
