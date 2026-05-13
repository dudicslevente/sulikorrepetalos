"use client";

import { useState } from "react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, parseISO, startOfDay } from "date-fns";
import { hu } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isHoliday, getHolidayForDate } from "@/lib/holidays";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/calendar";

type Props = {
  tutorId: string;
  postId: string;
  availabilitySlots: any[];
  availabilityExceptions?: any[];
  existingBookings: any[];
};

export default function WeeklyCalendarView({ tutorId, postId, availabilitySlots, availabilityExceptions = [], existingBookings }: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const today = startOfDay(new Date());

  const days = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));
  const timeSlots: string[] = [];
  for (let i = 7 * 2; i <= 21 * 2; i++) {
    const hours = Math.floor(i / 2);
    const mins = (i % 2) * 30;
    timeSlots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
  }

  const handleBooking = async (date: Date, startTime: string, endTime: string) => {
    if (!confirm(`Biztosan foglalsz erre az időpontra: ${format(date, "yyyy. MMMM d.", { locale: hu })} ${startTime}-${endTime}?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await createBooking(tutorId, postId, date.toISOString(), startTime, endTime);
      alert("Sikeres foglalás! A tutor értesítést kapott.");
      router.push("/foglalasaim");
    } catch (e: any) {
      alert(e.message || "Hiba történt a foglalás során.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <h3 className="text-lg font-semibold text-slate-800 capitalize">
          {format(startOfCurrentWeek, "yyyy. MMMM d.", { locale: hu })} - {format(addDays(startOfCurrentWeek, 6), "MMMM d.", { locale: hu })}
        </h3>
        <button
          onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-slate-50">
            <div className="p-3 text-center text-sm font-medium text-slate-500 border-r border-gray-200">
              Időpont
            </div>
            {days.map((day, i) => (
              <div key={i} className="p-3 text-center border-r border-gray-200 last:border-0">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {format(day, "EEEE", { locale: hu })}
                </div>
                <div className={`text-lg font-bold ${isSameDay(day, today) ? "text-primary-600" : "text-slate-800"}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 relative bg-slate-50">
            {/* Times */}
            <div className="flex flex-col border-r border-gray-200 bg-white z-10">
              {timeSlots.map((time, i) => (
                <div key={i} className="h-12 border-b border-gray-100 flex items-center justify-center text-xs font-medium text-slate-400">
                  {time}
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {days.map((day, dayIdx) => {
              const holiday = getHolidayForDate(day);
              const isPast = day < today;
              
              return (
                <div key={dayIdx} className={`relative border-r border-gray-200 last:border-0 ${holiday ? 'bg-red-50/30' : 'bg-white'}`}>
                  {/* Grid Lines */}
                  {timeSlots.map((_, i) => (
                    <div key={i} className="h-12 border-b border-gray-100 w-full absolute pointer-events-none" style={{ top: `${i * 3}rem` }}></div>
                  ))}

                  {/* Holiday Banner */}
                  {holiday && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-50/80 p-2 text-center pointer-events-none">
                      <span className="text-red-800 font-bold text-sm bg-white/90 px-3 py-1 rounded-full shadow-sm">Szünet / Ünnep</span>
                      <span className="text-red-600 text-xs mt-1 font-medium bg-white/90 px-2 py-0.5 rounded-full">{holiday.name}</span>
                    </div>
                  )}

                  {/* Slots */}
                  {!holiday && !isPast && availabilitySlots.map((slot) => {
                    const dayOfWeekNum = day.getDay() === 0 ? 7 : day.getDay();
                    if (slot.isRecurring && slot.dayOfWeek === dayOfWeekNum) {
                      
                      // Check if there is an exception for this specific slot on this date
                      const isException = availabilityExceptions.some(e => 
                        isSameDay(new Date(e.date), day) && 
                        e.startTime === slot.startTime && 
                        e.endTime === slot.endTime
                      );

                      if (isException) return null; // Ne rendereljük ki, ha lemondta a tanár

                      // Check if already booked
                      const isBooked = existingBookings.some(b => 
                        isSameDay(parseISO(b.date), day) && 
                        ((b.startTime >= slot.startTime && b.startTime < slot.endTime) ||
                        (b.endTime > slot.startTime && b.endTime <= slot.endTime) ||
                        (b.startTime <= slot.startTime && b.endTime >= slot.endTime))
                      );

                      const startIdx = timeSlots.indexOf(slot.startTime);
                      const endIdx = timeSlots.indexOf(slot.endTime);
                      
                      if (startIdx !== -1 && endIdx !== -1) {
                        const top = startIdx * 3;
                        const height = (endIdx - startIdx) * 3;

                        if (isBooked) {
                          return (
                            <div 
                              key={`booked-${slot.id}`} 
                              className="absolute left-1 right-1 bg-gray-200 border border-gray-300 rounded-md p-1.5 z-10 flex flex-col justify-center cursor-not-allowed opacity-70"
                              style={{ top: `${top}rem`, height: `${height}rem` }}
                            >
                              <span className="text-xs font-bold text-gray-500">Foglalt</span>
                            </div>
                          );
                        }

                        return (
                          <button 
                            key={`free-${slot.id}`} 
                            onClick={() => handleBooking(day, slot.startTime, slot.endTime)}
                            disabled={loading}
                            className="absolute left-1 right-1 bg-primary-100 hover:bg-primary-200 hover:border-primary-400 border border-primary-200 rounded-md p-1.5 z-10 flex flex-col justify-center transition-colors text-left disabled:opacity-50"
                            style={{ top: `${top}rem`, height: `${height}rem` }}
                          >
                            <span className="text-xs font-bold text-primary-800">Szabad</span>
                            <span className="text-[10px] font-medium text-primary-600">{slot.startTime} - {slot.endTime}</span>
                          </button>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}