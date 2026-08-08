import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getAllPosts } from "@/lib/content/posts";
import { AdminPostsScreen } from "@/screens/admin-posts";

export default async function Page() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin}>
      <AdminPostsScreen posts={getAllPosts({ includeDrafts: true })} />
    </AdminShell>
  );
}
