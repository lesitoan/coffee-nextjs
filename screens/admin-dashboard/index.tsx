import Link from "next/link";
import type { BlogCategory, BlogPost } from "@/types/post";

type AdminDashboardScreenProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

export function AdminDashboardScreen({ posts, categories }: AdminDashboardScreenProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Posts", posts.length],
          ["Published", posts.filter((post) => post.status === "published").length],
          ["Categories", categories.filter((category) => category.id !== "all").length]
        ].map(([label, value]) => (
          <div key={label} className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">{label}</p>
            <p className="mt-2 font-serif text-4xl font-bold text-coffee-700">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-serif text-2xl font-bold text-stone-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new" className="rounded-sm bg-coffee-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-coffee-800">
            New Post
          </Link>
          <Link href="/admin/categories/new" className="rounded-sm border border-stone-300 px-5 py-3 text-sm font-bold text-stone-700 transition hover:border-coffee-700 hover:text-coffee-700">
            New Category
          </Link>
        </div>
      </div>
    </div>
  );
}
