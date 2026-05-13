"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createBooking(tutorId: string, postId: string, dateIso: string, startTime: string, endTime: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Be kell jelentkezned a foglaláshoz.");

  if (session.user.id === tutorId) {
    throw new Error("Saját hirdetésre nem foglalhatsz.");
  }

  // Check if slot is already taken
  const existingBooking = await prisma.booking.findFirst({
    where: {
      tutorId,
      date: new Date(dateIso),
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        }
      ]
    }
  });

  if (existingBooking) {
    throw new Error("Ez az időpont már foglalt.");
  }

  await prisma.booking.create({
    data: {
      studentId: session.user.id,
      tutorId,
      postId,
      date: new Date(dateIso),
      startTime,
      endTime,
      status: "PENDING"
    }
  });
}