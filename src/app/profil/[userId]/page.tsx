import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { User as UserIcon, Star, Calendar as CalendarIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import WeeklyCalendarView from "@/components/WeeklyCalendarView";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      tutoringPosts: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      },
      availabilitySlots: true,
      tutorRatings: {
        include: {
          student: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      tutorBookings: {
        where: {
          status: { in: ["CONFIRMED", "PENDING"] }
        }
      }
    },
  });

  if (!user) {
    notFound();
  }

  const ratings = user.tutorRatings;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length
      : 0;

  return (
    <div className="space-y-8">
      <Link href="/piacter" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-800 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Vissza a piactérre
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-primary-800"></div>
        <div className="px-6 md:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-6">
            <div className="relative">
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
            </div>

            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
              <div className="flex items-center mt-2 text-slate-600">
                <Star size={18} className="text-amber-500 fill-current mr-1" />
                <span className="font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : "Nincs még értékelés"}
                </span>
                {ratings.length > 0 && (
                  <span className="ml-1 text-slate-400">
                    ({ratings.length} db)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Bemutatkozás
            </h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {user.description || "Nem adott meg bemutatkozást."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Hirdetései</h2>
            {user.tutoringPosts.length === 0 ? (
              <p className="text-slate-500">Nincsenek aktív hirdetései.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.tutoringPosts.map((post) => (
                  <PostCard key={post.id} post={{ ...post, user }} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Értékelések</h2>
            {ratings.length === 0 ? (
              <p className="text-slate-500">Nincs még értékelése.</p>
            ) : (
              <div className="space-y-6">
                {ratings.map((rating) => (
                  <div key={rating.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} className={i < rating.stars ? "fill-current" : "text-gray-300"} />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-slate-800">{rating.subject}</span>
                    </div>
                    {rating.comment && <p className="text-slate-600 mb-2 text-sm">{rating.comment}</p>}
                    <div className="text-xs text-slate-400">
                      — {rating.student.name}, {new Date(rating.createdAt).toLocaleDateString("hu-HU")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <CalendarIcon className="text-primary-800 mr-2" size={20} />
              <h2 className="text-xl font-bold text-slate-900">Elérhetőség</h2>
            </div>
            {/* Minimal static view since full interactive is on post page */}
            {user.availabilitySlots.length === 0 ? (
              <p className="text-sm text-slate-500">Nem adott meg elérhetőséget.</p>
            ) : (
              <div className="space-y-3">
                {user.availabilitySlots.map(slot => (
                  <div key={slot.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-700">
                      {["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"][slot.dayOfWeek - 1]}
                    </span>
                    <span className="text-primary-800 font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}