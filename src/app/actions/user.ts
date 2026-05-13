"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const profilePicture = formData.get("profilePicture") as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      description,
      profilePicture,
    },
  });

  revalidatePath("/profil");
  return { success: true };
}