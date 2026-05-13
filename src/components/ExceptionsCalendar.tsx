"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from "date-fns";
import { hu } from "date-fns/locale";
import { ChevronLeft, ChevronRight, XCircle, Undo2 } from "lucide-react";
import { toggleException } from "@/app/actions/exceptions";
import { useRouter } from "next/navigation";

type Slot = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type Exception = {
  date: Date;
  startTime: string;
  endTime: string;
};

type Props = {
  defaultSlots: Slot[];
  exceptions: Exception[];
};

export default function ExceptionsCalendar({ defaultSlots, exceptions }: Props) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Az adott hét hétfője
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

  // A hét 7 napjának legenerálása
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

  const handlePrevWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));

  const handleToggle = async (date: Date, startTime: string, endTime: string) => {
    setLoading(true);
    try {
      const dateIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
      await toggleException(dateIso, startTime, endTime);
      router.refresh();
    } catch (e) {
      alert("Hiba történt a művelet során.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Kivételek & Naptár</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ha egy adott napon mégsem érsz rá (pl. utazás, betegség), itt lemondhatod a fix időpontjaidat.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
            {format(weekDays[0], "MMM d.", { locale: hu })} - {format(weekDays[6], "MMM d.", { locale: hu })}
          </div>
          <button onClick={handleNextWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Naptár rács */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map(day => {
          // JS napok: 0 = Vasárnap, 1 = Hétfő ... Mi 1=Hétfő, 7=Vasárnap logikát használunk a DB-ben
          const jsDay = day.getDay();
          const dbDay = jsDay === 0 ? 7 : jsDay;
          
          // Ezen a napon lévő alapértelmezett órák
          const daySlots = defaultSlots.filter(s => s.dayOfWeek === dbDay);
          
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toISOString()} className={`flex flex-col border rounded-xl overflow-hidden ${isToday ? 'border-primary-300 ring-1 ring-primary-300' : 'border-gray-200'}`}>
              {/* Nap fejléce */}
              <div className={`p-3 text-center border-b ${isToday ? 'bg-primary-50' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-primary-800' : 'text-slate-500'}`}>
                  {format(day, "EEEE", { locale: hu })}
                </div>
                <div className={`text-lg font-black mt-0.5 ${isToday ? 'text-primary-900' : 'text-slate-800'}`}>
                  {format(day, "d")}
                </div>
              </div>

              {/* Időpontok ezen a napon */}
              <div className="p-3 flex-1 bg-white flex flex-col gap-2 min-h-[120px]">
                {daySlots.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4 italic">Nincs óra</div>
                ) : (
                  daySlots.map(slot => {
                    // Megnézzük, hogy ez az időpont ezen a napon le van-e tiltva (kivétel)
                    const isException = exceptions.some(e => 
                      isSameDay(new Date(e.date), day) && 
                      e.startTime === slot.startTime && 
                      e.endTime === slot.endTime
                    );

                    return (
                      <button
                        key={`${slot.id}-${day.toISOString()}`}
                        onClick={() => handleToggle(day, slot.startTime, slot.endTime)}
                        disabled={loading}
                        className={`
                          w-full p-2 rounded-lg text-sm font-semibold flex items-center justify-between transition-all group
                          ${isException 
                            ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 opacity-60 hover:opacity-100 line-through' 
                            : 'bg-primary-50 text-primary-800 border border-primary-100 hover:bg-primary-800 hover:text-white'
                          }
                        `}
                      >
                        <span>{slot.startTime.split(':')[0]}:00</span>
                        
                        {isException ? (
                          <Undo2 size={14} className="opacity-50 group-hover:opacity-100" />
                        ) : (
                          <XCircle size={14} className="opacity-0 group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}