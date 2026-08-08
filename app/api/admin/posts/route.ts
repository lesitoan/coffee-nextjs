import { assertAdminApi } from "@/lib/auth/session";
import { normalizePost } from "@/lib/admin/validation";
import { savePostToGitHub } from "@/lib/admin/content-writer";
import { blogCategories } from "@/lib/content/site";
import { getAllPosts } from "@/lib/content/posts";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  return Response.json({ posts: getAllPosts({ includeDrafts: true }) });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const payload = await request.json();
    const post = normalizePost(payload, blogCategories.filter((category) => category.id !== "all"));
    await savePostToGitHub(post);
    return Response.json({ post });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save post." },
      { status: 400 }
    );
  }
}
