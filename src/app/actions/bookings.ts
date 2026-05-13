"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateBookingStatus(bookingId: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  // Verify permission
  if (booking.tutorId !== session.user.id && booking.studentId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
}