"use client";

import { updateBookingStatus } from "@/app/actions/bookings";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RatingModal from "./RatingModal";

type Props = {
  bookingId: string;
  status: string;
  role: "student" | "tutor";
  isPast: boolean;
  hasRating: boolean;
  tutorId?: string;
  tutorName?: string;
  subject?: string;
};

export default function BookingActionButtons({ 
  bookingId, 
  status, 
  role, 
  isPast,
  hasRating,
  tutorId,
  tutorName,
  subject
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    await updateBookingStatus(bookingId, newStatus);
    setLoading(false);
    router.refresh();
  };

  if (role === "tutor") {
    if (status === "PENDING") {
      return (
        <>
          <button
            onClick={() => handleStatusChange("CONFIRMED")}
            disabled={loading}
            className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-md hover:bg-primary-900 transition-colors disabled:opacity-50"
          >
            Elfogadás
          </button>
          <button
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={loading}
            className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Elutasítás
          </button>
        </>
      );
    }

    if (status === "CONFIRMED" && isPast) {
      return (
        <button
          onClick={() => handleStatusChange("COMPLETED")}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Teljesítve
        </button>
      );
    }
    
    if (status === "CONFIRMED" && !isPast) {
      return (
        <button
          onClick={() => handleStatusChange("CANCELLED")}
          disabled={loading}
          className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Lemondás
        </button>
      );
    }
  }

  if (role === "student") {
    if (status === "PENDING" || (status === "CONFIRMED" && !isPast)) {
      return (
        <button
          onClick={() => handleStatusChange("CANCELLED")}
          disabled={loading}
          className="px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Lemondás
        </button>
      );
    }

    if (status === "COMPLETED" && !hasRating) {
      return (
        <>
          <button
            onClick={() => setIsRatingModalOpen(true)}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-md hover:bg-amber-600 transition-colors disabled:opacity-50"
          >
            Értékelés írása
          </button>

          {tutorId && tutorName && subject && (
            <RatingModal
              isOpen={isRatingModalOpen}
              onClose={() => setIsRatingModalOpen(false)}
              bookingId={bookingId}
              tutorId={tutorId}
              subject={subject}
              tutorName={tutorName}
            />
          )}
        </>
      );
    }
    
    if (status === "COMPLETED" && hasRating) {
      return (
        <span className="px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-md">
          Értékelve
        </span>
      );
    }
  }

  return null;
}