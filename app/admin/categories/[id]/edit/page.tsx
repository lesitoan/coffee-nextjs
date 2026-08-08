import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getEditableCategories } from "@/lib/content/site";
import { AdminCategoryEditorScreen } from "@/screens/admin-category-editor";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const admin = await requireAdmin();
  const { id } = await params;
  const category = getEditableCategories().find((item) => item.id === id);
  if (!category) notFound();

  return (
    <AdminShell admin={admin}>
      <AdminCategoryEditorScreen category={category} />
    </AdminShell>
  );
}
