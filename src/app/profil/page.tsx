import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { User as UserIcon, Star, Edit, Plus } from "lucide-react";
import Link from "next/link";
import AvailabilityEditor from "@/components/AvailabilityEditor";
import DeletePostButton from "@/components/DeletePostButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/bejelentkezes");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tutoringPosts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      availabilitySlots: true,
      tutorRatings: true,
    },
  });

  if (!user) redirect("/bejelentkezes");

  const avgRating =
    user.tutorRatings.length > 0
      ? user.tutorRatings.reduce((acc, curr) => acc + curr.stars, 0) /
        user.tutorRatings.length
      : 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-primary-800"></div>
        <div className="px-6 md:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
            <div className="relative group">
              {user.profilePicture ? (
                <Image
                  src={user.profilePicture}
                  alt={user.name}
                  width={120}
                  height={120}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover bg-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center text-primary-800">
                  <UserIcon size={48} />
                </div>
              )}
              {/* TODO: Add profile picture upload button overlay here */}
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
              <div className="flex items-center mt-2 text-slate-600">
                <Star size={18} className="text-amber-500 fill-current mr-1" />
                <span className="font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : "Nincs még értékelés"}
                </span>
                {user.tutorRatings.length > 0 && (
                  <span className="ml-1 text-slate-400">
                    ({user.tutorRatings.length} db)
                  </span>
                )}
              </div>
            </div>

            <div className="pb-2">
              <Link
                href="/profil/szerkesztes"
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
              >
                <Edit size={16} className="mr-2" />
                Profil szerkesztése
              </Link>
            </div>
          </div>

          <div className="max-w-3xl">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Bemutatkozás
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {user.description || "Még nem adtál meg bemutatkozást."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Hirdetéseim</h2>
              <Link
                href="/hirdetesfeladas"
                className="inline-flex items-center px-3 py-1.5 bg-primary-100 text-primary-800 rounded-md hover:bg-primary-200 transition-colors font-medium text-sm"
              >
                <Plus size={16} className="mr-1" />
                Új hirdetés
              </Link>
            </div>

            {user.tutoringPosts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                Még nincsenek aktív hirdetéseid.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.tutoringPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col justify-between p-4 border border-gray-100 rounded-xl hover:border-primary-200 transition-colors gap-4"
                  >
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-primary-50 text-primary-800 rounded-full">
                          {post.subject}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {post.gradeLevel}
                        </span>
                      </div>
                      <Link href={`/piacter/${post.id}`} className="text-lg font-bold text-slate-800 hover:text-primary-800 transition-colors block line-clamp-2">
                        {post.title}
                      </Link>
                    </div>
                    
                    <div className="flex items-center justify-end border-t border-gray-50 pt-3 mt-1">
                      <DeletePostButton postId={post.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Elérhetőségem (Órarend)</h2>
            <p className="text-slate-600 mb-8 max-w-3xl">
              Állítsd be, hogy melyik napokon, mikor érsz rá korrepetálást tartani. Jelöld ki azokat az órákat, amiket a diákok lefoglalhatnak nálad.
            </p>
            <AvailabilityEditor initialSlots={user.availabilitySlots} />
          </div>
        </div>
      </div>
    </div>
  );
}