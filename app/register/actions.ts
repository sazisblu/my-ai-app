"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createClient } from "../../utils/supabase/server";
import { cookies } from "next/headers";
const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .trim(),
    confirmPassword: z
      .string()
      .min(8, { message: "the password must be 8 characters long" })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function register(prevState: any, formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // Hash password
  const hashedpass = await bcrypt.hash(password, 10);

  // Insert user into Supabase
  const supabase = await createClient(cookies());
  const { data, error } = await supabase
    .from("users")
    .insert({ email, hashedpasswords: hashedpass })
    .select()
    .single();

  if (error) {
    console.error("Registration error:", error);
    return { errors: { email: [error.message] } };
  }

  console.log("User registered successfully:", data?.email);

  redirect("/");
}
