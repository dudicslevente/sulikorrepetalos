"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePost } from "@/app/actions/posts";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Biztosan törölni szeretnéd ezt a hirdetést? Ezt a műveletet nem lehet visszavonni.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePost(postId);
      router.refresh();
    } catch (e) {
      alert("Hiba történt a törlés során.");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className={`p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
      title="Törlés"
    >
      <Trash2 size={18} />
    </button>
  );
}