import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Search, Filter } from "lucide-react";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; subject?: string; grade?: string };
}) {
  const { q, subject, grade } = searchParams;

  const whereClause: any = {
    isActive: true,
  };

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }

  if (subject && subject !== "Mind") {
    whereClause.subject = subject;
  }

  if (grade && grade !== "Mind") {
    whereClause.gradeLevel = grade;
  }

  const posts = await prisma.tutoringPost.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
          tutorRatings: {
            select: { stars: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subjects = [
    "Mind",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Piactér</h1>
        <p className="text-slate-600 mt-1">
          Keress és találj megfelelő korrepetálót a tanulmányaidhoz!
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <form className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={q}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Keresés kulcsszó alapján..."
            />
          </div>
          <div className="md:w-48">
            <select
              name="subject"
              defaultValue={subject || "Mind"}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:w-48">
            <select
              name="grade"
              defaultValue={grade || "Mind"}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="Mind">Minden évfolyam</option>
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
          <button
            type="submit"
            className="bg-primary-800 text-white px-4 py-2 rounded-md hover:bg-primary-900 transition-colors"
          >
            Szűrés
          </button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-lg">Nincs találat a megadott feltételekkel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}