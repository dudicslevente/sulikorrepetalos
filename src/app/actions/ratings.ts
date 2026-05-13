"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRating(
  bookingId: string,
  tutorId: string,
  subject: string,
  stars: number,
  comment?: string
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ellenőrizzük, hogy a foglalás létezik-e és a diákhoz tartozik-e
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.studentId !== session.user.id) {
    throw new Error("Invalid booking");
  }

  // Ellenőrizzük, hogy van-e már értékelés erre a foglalásra
  const existingRating = await prisma.rating.findUnique({
    where: { bookingId },
  });

  if (existingRating) {
    throw new Error("You have already rated this booking");
  }

  await prisma.rating.create({
    data: {
      bookingId,
      tutorId,
      studentId: session.user.id,
      subject,
      stars,
      comment,
    },
  });

  revalidatePath("/foglalasaim");
  revalidatePath(`/profil/${tutorId}`);
  return { success: true };
}