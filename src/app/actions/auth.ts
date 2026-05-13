"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "A névnek legalább 2 karakternek kell lennie"),
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(6, "A jelszónak legalább 6 karakternek kell lennie"),
});

export async function registerUser(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    if (rawData.password !== rawData.passwordConfirm) {
      return { error: "A jelszavak nem egyeznek" };
    }

    const validatedData = registerSchema.safeParse(rawData);

    if (!validatedData.success) {
      return { error: (validatedData.error as any).errors[0].message };
    }

    const { name, email, password } = validatedData.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Ezzel az email címmel már regisztráltak" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Hiba történt a regisztráció során" };
  }
}