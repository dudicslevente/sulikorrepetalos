"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function deletePost(postId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ellenőrizzük, hogy a hirdetés a bejelentkezett felhasználóhoz tartozik-e
  const post = await prisma.tutoringPost.findUnique({
    where: { id: postId }
  });

  if (!post || post.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.tutoringPost.delete({
    where: { id: postId },
  });

  return { success: true };
}