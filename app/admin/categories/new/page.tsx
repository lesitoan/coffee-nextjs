import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { AdminCategoryEditorScreen } from "@/screens/admin-category-editor";

export default async function Page() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin}>
      <AdminCategoryEditorScreen />
    </AdminShell>
  );
}
