import Link from "next/link";
import type { BlogCategory } from "@/types/post";

type AdminCategoriesScreenProps = {
  categories: BlogCategory[];
};

export function AdminCategoriesScreen({ categories }: AdminCategoriesScreenProps) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-6">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">Categories</p>
          <h2 className="font-serif text-2xl font-bold text-stone-900">Blog Categories</h2>
        </div>
        <Link href="/admin/categories/new" className="rounded-sm bg-coffee-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-coffee-800">
          Create Category
        </Link>
      </div>
      <div className="divide-y divide-stone-100">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col justify-between gap-3 py-4 md:flex-row md:items-center">
            <div>
              <p className="font-bold text-stone-900">{category.label}</p>
              <p className="text-xs text-stone-500">{category.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-sm bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">{category.status || "active"}</span>
              <Link href={`/admin/categories/${category.id}/edit`} className="font-bold text-coffee-700 hover:underline">
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
