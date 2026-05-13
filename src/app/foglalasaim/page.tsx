import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import BookingActionButtons from "@/components/BookingActionButtons";
import ExceptionsCalendar from "@/components/ExceptionsCalendar";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/bejelentkezes");

  const tab = searchParams.tab || "student"; // "student" | "tutor" | "calendar"

  // Csak lekérdezzük a tutorhoz kapcsolódó adatokat, ha szükség van rájuk
  const isTutor = await prisma.tutoringPost.findFirst({
    where: { userId: session.user.id }
  });

  const studentBookings = await prisma.booking.findMany({
    where: { studentId: session.user.id },
    include: {
      post: true,
      tutor: { select: { id: true, name: true, profilePicture: true } },
      rating: true,
    },
    orderBy: { date: "asc" },
  });

  const tutorBookings = await prisma.booking.findMany({
    where: { tutorId: session.user.id },
    include: {
      post: true,
      student: { select: { id: true, name: true, profilePicture: true } },
      rating: true,
    },
    orderBy: { date: "asc" },
  });

  const defaultSlots = await prisma.availabilitySlot.findMany({
    where: { userId: session.user.id }
  });

  const exceptions = await prisma.availabilityException.findMany({
    where: { userId: session.user.id }
  });

  const displayBookings = tab === "student" ? studentBookings : tutorBookings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Foglalásaim</h1>
        <p className="text-slate-600 mt-1">
          Kezeld a közelgő és múltbéli korrepetálásaidat.
        </p>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        <Link
          href="/foglalasaim?tab=student"
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            tab === "student"
              ? "border-primary-800 text-primary-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Mint tanuló ({studentBookings.length})
        </Link>
        {isTutor && (
          <>
            <Link
              href="/foglalasaim?tab=tutor"
              className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === "tutor"
                  ? "border-primary-800 text-primary-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Mint tutor ({tutorBookings.length})
            </Link>
            <Link
              href="/foglalasaim?tab=calendar"
              className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === "calendar"
                  ? "border-primary-800 text-primary-800"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Saját Naptáram
            </Link>
          </>
        )}
      </div>

      {tab === "calendar" && isTutor ? (
        <ExceptionsCalendar defaultSlots={defaultSlots} exceptions={exceptions} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {displayBookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Még nincsenek foglalásaid ebben a kategóriában.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {displayBookings.map((booking) => {
                const otherPerson: any =
                  tab === "student" ? (booking as any).tutor : (booking as any).student;
                const isPast = new Date(booking.date) < new Date(new Date().setHours(0,0,0,0));

                return (
                  <li key={booking.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            booking.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                            booking.status === "CONFIRMED" ? "bg-primary-100 text-primary-800" :
                            booking.status === "COMPLETED" ? "bg-blue-100 text-blue-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {booking.status === "PENDING" ? "Függőben" :
                             booking.status === "CONFIRMED" ? "Visszaigazolva" :
                             booking.status === "COMPLETED" ? "Teljesítve" :
                             "Lemondva"}
                          </span>
                          <span className="text-sm font-medium text-slate-500">
                            {format(new Date(booking.date), "yyyy. MMMM d.", { locale: hu })} • {booking.startTime} - {booking.endTime}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800">
                          {booking.post.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Tantárgy: <span className="font-medium">{booking.post.subject}</span>
                        </p>
                        
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-sm text-slate-500">
                            {tab === "student" ? "Tutor:" : "Tanuló:"}
                          </span>
                          <Link href={`/profil/${otherPerson.id}`} className="text-sm font-medium text-primary-800 hover:underline">
                            {otherPerson.name}
                          </Link>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookingActionButtons 
                          bookingId={booking.id} 
                          status={booking.status} 
                          role={tab as "student" | "tutor"} 
                          isPast={isPast}
                          hasRating={!!booking.rating}
                          tutorId={tab === "student" ? (booking as any).tutor.id : undefined}
                          tutorName={tab === "student" ? (booking as any).tutor.name : undefined}
                          subject={booking.post.subject}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}