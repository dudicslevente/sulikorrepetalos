import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, User as UserIcon, Calendar as CalendarIcon, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import WeeklyCalendarView from "@/components/WeeklyCalendarView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: { postId: string };
}) {
  const session = await getServerSession(authOptions);
  
  const post = await prisma.tutoringPost.findUnique({
    where: { id: params.postId },
    include: {
      user: {
        include: {
          tutorRatings: true,
          availabilitySlots: true,
          availabilityExceptions: true,
          tutorBookings: {
            where: {
              status: { in: ["CONFIRMED", "PENDING"] }
            }
          }
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  const ratings = post.user.tutorRatings;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/piacter" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-800 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Vissza a piactérre
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-800 text-sm font-medium rounded-full">
                {post.subject}
              </span>
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                {post.gradeLevel}
              </span>
            </div>
            {post.priceNote && (
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 text-sm font-medium rounded-full">
                {post.priceNote}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-6">{post.title}</h1>

          <div className="prose prose-slate max-w-none mb-8 whitespace-pre-wrap">
            {post.description}
          </div>

          <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
            {post.user.profilePicture ? (
              <Image
                src={post.user.profilePicture}
                alt={post.user.name}
                width={64}
                height={64}
                className="rounded-full object-cover w-16 h-16 mr-4"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 mr-4">
                <UserIcon size={32} />
              </div>
            )}
            <div className="flex-1">
              <Link href={`/profil/${post.user.id}`} className="text-lg font-bold text-slate-900 hover:text-primary-800 hover:underline">
                {post.user.name}
              </Link>
              <div className="flex items-center text-sm text-amber-500 mt-1">
                <Star size={16} className="fill-current" />
                <span className="ml-1 text-slate-700 font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : "Új tutor"}
                </span>
                {ratings.length > 0 && (
                  <span className="text-slate-500 ml-1">
                    ({ratings.length} értékelés)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center mb-6">
          <CalendarIcon className="text-primary-800 mr-2" size={24} />
          <h2 className="text-2xl font-bold text-slate-900">Foglalás</h2>
        </div>
        <p className="text-slate-600 mb-6">
          Válassz egy szabad időpontot a lenti naptárból. Zölddel jelöltük a szabad helyeket.
        </p>
        
        {session?.user?.id === post.userId ? (
          <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200">
            Ez a saját hirdetésed, így nem tudsz időpontot foglalni.
          </div>
        ) : (
          <WeeklyCalendarView 
            tutorId={post.userId}
            postId={post.id}
            availabilitySlots={post.user.availabilitySlots} 
            availabilityExceptions={post.user.availabilityExceptions}
            existingBookings={post.user.tutorBookings}
          />
        )}
      </div>
    </div>
  );
}