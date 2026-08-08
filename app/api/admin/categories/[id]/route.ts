import { assertAdminApi } from "@/lib/auth/session";
import { saveCategoriesToGitHub } from "@/lib/admin/content-writer";
import { normalizeCategory } from "@/lib/admin/validation";
import { blogCategories } from "@/lib/content/site";
import { getAllPosts } from "@/lib/content/posts";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const payload = await request.json();
    const category = normalizeCategory({ ...payload, id }, blogCategories);
    const found = blogCategories.some((item) => item.id === id);
    if (!found) return Response.json({ error: "Category not found." }, { status: 404 });

    const nextCategories = blogCategories.map((item) => (item.id === id ? category : item));
    await saveCategoriesToGitHub(nextCategories);
    return Response.json({ category });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not update category." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (id === "all") return Response.json({ error: "Default category cannot be deleted." }, { status: 400 });

  const isUsed = getAllPosts({ includeDrafts: true }).some((post) => post.category === id);
  if (isUsed) {
    return Response.json({ error: "This category is used by one or more posts." }, { status: 400 });
  }

  const nextCategories = blogCategories.filter((category) => category.id !== id);
  await saveCategoriesToGitHub(nextCategories);
  return Response.json({ ok: true });
}
