import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getEditableCategories } from "@/lib/content/site";
import { AdminPostEditorScreen } from "@/screens/admin-post-editor";

export default async function Page() {
  const admin = await requireAdmin();

  return (
    <AdminShell admin={admin}>
      <AdminPostEditorScreen categories={getEditableCategories()} />
    </AdminShell>
  );
}
