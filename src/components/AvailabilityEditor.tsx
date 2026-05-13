"use client";

import { useState, useEffect } from "react";
import { saveAvailability } from "@/app/actions/availability";
import { Copy, CalendarDays, CheckCircle2, Clock } from "lucide-react";

type Slot = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export default function AvailabilityEditor({ initialSlots }: { initialSlots: Slot[] }) {
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  
  const [selections, setSelections] = useState<Record<number, number[]>>({
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
  });

  const DAYS = [
    { id: 1, name: "Hétfő", short: "Hé" },
    { id: 2, name: "Kedd", short: "Ke" },
    { id: 3, name: "Szerda", short: "Sze" },
    { id: 4, name: "Csütörtök", short: "Csü" },
    { id: 5, name: "Péntek", short: "Pé" },
    { id: 6, name: "Szombat", short: "Szo" },
    { id: 7, name: "Vasárnap", short: "Va" },
  ];

  const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

  useEffect(() => {
    if (!initialSlots || initialSlots.length === 0) return;
    
    const initialMap: Record<number, number[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    };

    initialSlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      for (let h = startHour; h < endHour; h++) {
        if (!initialMap[slot.dayOfWeek].includes(h)) {
          initialMap[slot.dayOfWeek].push(h);
        }
      }
    });

    setSelections(initialMap);
  }, [initialSlots]);

  const toggleHour = (hour: number) => {
    setSelections(prev => {
      const daySelections = prev[activeDay];
      if (daySelections.includes(hour)) {
        return { ...prev, [activeDay]: daySelections.filter(h => h !== hour) };
      } else {
        return { ...prev, [activeDay]: [...daySelections, hour].sort((a, b) => a - b) };
      }
    });
  };

  const copyToWeekdays = () => {
    const current = selections[activeDay];
    setSelections(prev => ({
      ...prev,
      1: [...current],
      2: [...current],
      3: [...current],
      4: [...current],
      5: [...current],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const slotsToSave: Slot[] = [];
      Object.entries(selections).forEach(([dayStr, hours]) => {
        const dayOfWeek = parseInt(dayStr);
        hours.forEach(h => {
          slotsToSave.push({
            dayOfWeek,
            startTime: `${h.toString().padStart(2, '0')}:00`,
            endTime: `${(h + 1).toString().padStart(2, '0')}:00`
          });
        });
      });
      await saveAvailability(slotsToSave);
    } catch (e) {
      alert("Hiba történt a mentés során.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selections).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-2xl border border-gray-200 overflow-hidden min-h-[500px]">
      {/* Bal oldalsáv (Napok) - Mobilon felső sor, Gépen oldalsáv */}
      <div className="w-full md:w-32 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col overflow-x-auto no-scrollbar">
        {DAYS.map(day => {
          const isActive = activeDay === day.id;
          const hasSelection = selections[day.id].length > 0;
          
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`
                flex-1 md:flex-none py-4 px-3 text-center md:text-left transition-all relative
                ${isActive ? 'bg-white md:bg-primary-50 text-primary-800' : 'text-gray-500 hover:bg-gray-100'}
              `}
            >
              <div className="flex md:flex-row flex-col items-center justify-between gap-1">
                <span className={`text-xs md:text-sm font-bold uppercase md:capitalize tracking-wider md:tracking-normal`}>
                  <span className="hidden md:inline">{day.name}</span>
                  <span className="md:hidden">{day.short}</span>
                </span>
                {hasSelection && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                )}
              </div>
              
              {/* Aktív jelző vonal - Mobilon alul, Gépen bal oldalt */}
              {isActive && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-800 md:hidden"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary-800 hidden md:block"></div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Jobb oldali tartalom (Órák) */}
      <div className="flex-1 p-5 md:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-primary-800" />
              {DAYS.find(d => d.id === activeDay)?.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Válaszd ki, mikor érsz rá ezen a napon:</p>
          </div>
          
          {selections[activeDay].length > 0 && activeDay <= 5 && (
            <button 
              onClick={copyToWeekdays}
              className="self-start text-xs font-semibold text-primary-700 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-primary-100"
            >
              <Copy size={14} />
              Másolás hétköznapokra
            </button>
          )}
        </div>

        {/* Órák rácsa - Szellősebb elrendezés */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-auto">
          {HOURS.map(hour => {
            const isSelected = selections[activeDay].includes(hour);
            return (
              <button
                key={hour}
                onClick={() => toggleHour(hour)}
                className={`
                  py-4 rounded-2xl text-sm font-bold transition-all duration-200 border-2
                  ${isSelected 
                    ? 'bg-primary-800 border-primary-800 text-white shadow-lg transform scale-[1.03] z-10' 
                    : 'bg-white border-gray-100 text-slate-600 hover:border-primary-200 hover:bg-primary-50/30'
                  }
                `}
              >
                {hour.toString().padStart(2, '0')}:00
              </button>
            );
          })}
        </div>

        {/* Mentés szekció */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Kiválasztott órák a héten: <span className="font-bold text-primary-800 text-base">{selectedCount}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-primary-800 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-primary-900/20 flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? "Mentés..." : (
              <>
                <CheckCircle2 size={20} />
                Változások mentése
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}