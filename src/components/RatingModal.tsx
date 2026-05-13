"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { createRating } from "@/app/actions/ratings";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  tutorId: string;
  subject: string;
  tutorName: string;
};

export default function RatingModal({
  isOpen,
  onClose,
  bookingId,
  tutorId,
  subject,
  tutorName,
}: Props) {
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      alert("Kérlek válassz csillagot az értékeléshez!");
      return;
    }

    setLoading(true);
    try {
      await createRating(bookingId, tutorId, subject, stars, comment);
      onClose();
    } catch (error) {
      alert("Hiba történt az értékelés mentésekor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Értékelés</h2>
          <p className="text-sm text-slate-600 mb-6">
            Milyen volt a korrepetálás <span className="font-semibold text-slate-800">{tutorName}</span> tanárral?
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStars(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={
                        star <= (hoveredStar || stars)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-amber-600">
                {stars === 1 && "Nagyon rossz"}
                {stars === 2 && "Rossz"}
                {stars === 3 && "Közepes"}
                {stars === 4 && "Jó"}
                {stars === 5 && "Kiváló!"}
                {stars === 0 && "Kattints a csillagokra"}
              </span>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">
                Szöveges értékelés (opcionális)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                placeholder="Írd le a tapasztalataidat..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || stars === 0}
                className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Mentés folyamatban..." : "Értékelés elküldése"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}