import { isWithinInterval, parseISO, startOfDay } from "date-fns";

export type Holiday = {
  name: string;
  start: Date;
  end: Date;
};

export const HOLIDAYS: Holiday[] = [
  {
    name: "Nemzeti ünnep",
    start: parseISO("2024-10-23"),
    end: parseISO("2024-10-23"),
  },
  {
    name: "Őszi szünet",
    start: parseISO("2024-10-28"),
    end: parseISO("2024-11-01"),
  },
  {
    name: "Téli szünet",
    start: parseISO("2024-12-21"),
    end: parseISO("2025-01-03"),
  },
  {
    name: "Nemzeti ünnep",
    start: parseISO("2025-03-15"),
    end: parseISO("2025-03-15"),
  },
  {
    name: "Tavaszi szünet",
    start: parseISO("2025-04-17"),
    end: parseISO("2025-04-22"),
  },
  {
    name: "Pünkösdhétfő",
    start: parseISO("2025-06-09"),
    end: parseISO("2025-06-09"),
  },
  {
    name: "Nyári szünet",
    start: parseISO("2025-06-21"),
    end: parseISO("2025-08-31"),
  },
];

export function getHolidayForDate(date: Date): Holiday | null {
  const targetDate = startOfDay(date);
  for (const holiday of HOLIDAYS) {
    if (
      isWithinInterval(targetDate, {
        start: startOfDay(holiday.start),
        end: startOfDay(holiday.end),
      })
    ) {
      return holiday;
    }
  }
  return null;
}

export function isHoliday(date: Date): boolean {
  return getHolidayForDate(date) !== null;
}
