import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getEditableCategories } from "@/lib/content/site";
import { AdminCategoriesScreen } from "@/screens/admin-categories";

export default async function Page() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin}>
      <AdminCategoriesScreen categories={getEditableCategories()} />
    </AdminShell>
  );
}
