"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function saveAvailability(slots: any[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.$transaction([
    prisma.availabilitySlot.deleteMany({
      where: { userId: session.user.id },
    }),
    prisma.availabilitySlot.createMany({
      data: slots.map((s) => ({
        userId: session.user.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isRecurring: true,
      })),
    }),
  ]);
}