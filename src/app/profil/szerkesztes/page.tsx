import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { updateProfile } from "@/app/actions/user";
import { ChevronLeft } from "lucide-react";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/bejelentkezes");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/bejelentkezes");

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateProfile(formData);
    redirect("/profil");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/profil" 
          className="p-2 text-slate-400 hover:text-primary-800 hover:bg-primary-50 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Profil szerkesztése</h1>
          <p className="text-slate-600 mt-1">
            Frissítsd a személyes adataidat és a bemutatkozásodat.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        <form action={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Teljes név
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="Pl. Kovács János"
            />
          </div>

          <div>
            <label htmlFor="profilePicture" className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Profilkép URL (opcionális)
            </label>
            <input
              id="profilePicture"
              name="profilePicture"
              type="url"
              defaultValue={user.profilePicture || ""}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="https://example.com/kepeim/profi.jpg"
            />
            <p className="mt-2 text-xs text-slate-400 italic">
              Megjegyzés: Jelenleg csak külső URL-t tudsz megadni a profilképednek.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
              Bemutatkozás
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={user.description || ""}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-all"
              placeholder="Írd le pár mondatban ki vagy, mit tanítasz és miért szeretsz korrepetálni..."
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
            <Link
              href="/profil"
              className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
            >
              Mégsem
            </Link>
            <button
              type="submit"
              className="bg-primary-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-900 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Változások mentése
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}