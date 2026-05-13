import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CreatePostPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/bejelentkezes");
  }

  async function createPost(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    const title = formData.get("title") as string;
    const subject = formData.get("subject") as string;
    const gradeLevel = formData.get("gradeLevel") as string;
    const description = formData.get("description") as string;
    const priceNote = formData.get("priceNote") as string;

    await prisma.tutoringPost.create({
      data: {
        userId: session.user.id,
        title,
        subject,
        gradeLevel,
        description,
        priceNote,
      },
    });

    redirect("/profil");
  }

  const subjects = [
    "Matematika",
    "Magyar nyelv és irodalom",
    "Angol",
    "Német",
    "Francia",
    "Orosz",
    "Fizika",
    "Kémia",
    "Biológia",
    "Történelem",
    "Digitális kultúra",
    "Vizuális kultúra",
    "Egyéb",
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Hirdetésfeladás</h1>
        <p className="text-slate-600 mt-1">
          Oszd meg tudásod és segíts másoknak a tanulásban!
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <form action={createPost} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Hirdetés címe
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Pl. Érettségi felkészítés matematikából"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                Tantárgy
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Válassz tantárgyat</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700 mb-1">
                Évfolyam
              </label>
              <select
                id="gradeLevel"
                name="gradeLevel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">Válassz évfolyamot</option>
                <option value="5. osztály">5. osztály</option>
                <option value="6. osztály">6. osztály</option>
                <option value="7. osztály">7. osztály</option>
                <option value="8. osztály">8. osztály</option>
                <option value="9. osztály">9. osztály</option>
                <option value="10. osztály">10. osztály</option>
                <option value="11. osztály">11. osztály</option>
                <option value="12. osztály">12. osztály</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Részletes leírás
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Írd le miben tudsz segíteni, milyen módszerekkel tanítasz..."
            />
          </div>

          <div>
            <label htmlFor="priceNote" className="block text-sm font-medium text-slate-700 mb-1">
              Ár / Megjegyzés az árhoz (opcionális)
            </label>
            <input
              id="priceNote"
              name="priceNote"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Pl. Ingyenes, vagy 1000 Ft/óra"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <a
              href="/profil"
              className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Mégsem
            </a>
            <button
              type="submit"
              className="bg-primary-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-900 transition-colors shadow-sm"
            >
              Hirdetés közzététele
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}