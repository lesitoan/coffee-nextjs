import { assertAdminApi } from "@/lib/auth/session";
import { saveCategoriesToGitHub } from "@/lib/admin/content-writer";
import { normalizeCategory } from "@/lib/admin/validation";
import { blogCategories } from "@/lib/content/site";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  return Response.json({ categories: blogCategories.filter((category) => category.id !== "all") });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const payload = await request.json();
    const newCategory = normalizeCategory(payload, blogCategories);
    if (blogCategories.some((category) => category.id === newCategory.id)) {
      throw new Error("Category slug already exists.");
    }
    const nextCategories = [...blogCategories, newCategory];
    await saveCategoriesToGitHub(nextCategories);
    return Response.json({ category: newCategory });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save category." },
      { status: 400 }
    );
  }
}
