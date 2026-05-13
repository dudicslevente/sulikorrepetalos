"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleException(dateIso: string, startTime: string, endTime: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const date = new Date(dateIso);
  
  // Megnézzük, van-e már ilyen kivétel
  const existingException = await prisma.availabilityException.findFirst({
    where: {
      userId,
      date,
      startTime,
      endTime,
    },
  });

  if (existingException) {
    // Ha van, akkor töröljük (visszaállítjuk a szabad időpontot)
    await prisma.availabilityException.delete({
      where: { id: existingException.id },
    });
  } else {
    // Ha nincs, akkor létrehozzuk (letiltjuk az időpontot)
    await prisma.availabilityException.create({
      data: {
        userId,
        date,
        startTime,
        endTime,
      },
    });
  }

  revalidatePath("/foglalasaim");
  return { success: true };
}