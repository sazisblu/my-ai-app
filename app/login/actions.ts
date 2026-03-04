"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createSession, deleteSession } from "../lib/sessions";
import { createClient } from "../../utils/supabase/server";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Query Supabase for user
  const supabase = await createClient(cookies());
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, hashedpasswords")
    .eq("email", email)
    .single();

  if (error || !user) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.hashedpasswords);

  if (!passwordMatch) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  // Create session with user ID from database
  await createSession(String(user.id));

  redirect("/chat");
}

