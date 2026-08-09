import Link from "next/link";
import type { BlogPost } from "@/types/post";

type AdminPostsScreenProps = {
  posts: BlogPost[];
};

export function AdminPostsScreen({ posts }: AdminPostsScreenProps) {
  return (
    <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">Posts</p>
          <h2 className="font-serif text-2xl font-bold text-stone-900">All Posts</h2>
        </div>
        <Link href="/admin/posts/new" className="rounded-sm bg-coffee-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-coffee-800">
          Create Post
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
            <tr>
              <th className="py-3 pr-4">Title</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Updated</th>
              <th className="py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {posts.map((post) => (
              <tr key={post.slug}>
                <td className="py-4 pr-4">
                  <p className="font-bold text-stone-900">{post.title}</p>
                  <p className="text-xs text-stone-500">/blogs/{post.slug}</p>
                </td>
                <td className="py-4 pr-4 text-stone-600">{post.categoryName}</td>
                <td className="py-4 pr-4">
                  <span className="rounded-sm bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">{post.status}</span>
                </td>
                <td className="py-4 pr-4 text-stone-600">{post.updatedAt}</td>
                <td className="py-4 text-right">
                  <Link href={`/admin/posts/${post.slug}/edit`} className="font-bold text-coffee-700 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
