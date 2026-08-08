import { notFound } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdmin } from "@/lib/auth/session";
import { getPostBySlug } from "@/lib/content/posts";
import { getEditableCategories } from "@/lib/content/site";
import { AdminPostEditorScreen } from "@/screens/admin-post-editor";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({ params }: Props) {
  const admin = await requireAdmin();
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <AdminShell admin={admin}>
      <AdminPostEditorScreen post={post} categories={getEditableCategories()} />
    </AdminShell>
  );
}
