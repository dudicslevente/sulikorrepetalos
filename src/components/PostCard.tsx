import Link from "next/link";
import { Star, User as UserIcon } from "lucide-react";
import Image from "next/image";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    subject: string;
    description: string;
    gradeLevel: string;
    user: {
      id: string;
      name: string;
      profilePicture: string | null;
      tutorRatings: { stars: number }[];
    };
  };
};

export default function PostCard({ post }: PostCardProps) {
  const ratings = post.user.tutorRatings;
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length
      : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:border-primary-500 transition-colors flex flex-col h-full">
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block px-2.5 py-1 bg-primary-50 text-primary-800 text-xs font-medium rounded-full">
            {post.subject}
          </span>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {post.gradeLevel}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-1">
          {post.description}
        </p>

        <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
          <Link
            href={`/profil/${post.user.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {post.user.profilePicture ? (
              <Image
                src={post.user.profilePicture}
                alt={post.user.name}
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-800">
                <UserIcon size={16} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800 line-clamp-1">
                {post.user.name}
              </span>
              <div className="flex items-center text-xs text-amber-500">
                <Star size={12} className="fill-current" />
                <span className="ml-1 text-slate-600 font-medium">
                  {avgRating > 0 ? avgRating.toFixed(1) : "Új"}
                </span>
                {ratings.length > 0 && (
                  <span className="text-slate-400 ml-1">({ratings.length})</span>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="px-5 pb-5 pt-2">
        <Link
          href={`/piacter/${post.id}`}
          className="block w-full text-center bg-white border-2 border-primary-800 text-primary-800 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors"
        >
          Részletek
        </Link>
      </div>
    </div>
  );
}