import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { blogCategories } from "@/lib/content/site";
import { getAllPosts } from "@/lib/content/posts";
import { AdminDashboardScreen } from "@/screens/admin-dashboard";

export default async function Page() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin}>
      <AdminDashboardScreen posts={getAllPosts({ includeDrafts: true })} categories={blogCategories} />
    </AdminShell>
  );
}
