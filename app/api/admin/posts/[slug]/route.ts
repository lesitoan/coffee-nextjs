import { assertAdminApi } from "@/lib/auth/session";
import { deletePostFromGitHub, savePostToGitHub } from "@/lib/admin/content-writer";
import { normalizePost } from "@/lib/admin/validation";
import { getPostBySlug } from "@/lib/content/posts";
import { blogCategories } from "@/lib/content/site";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: Props) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return Response.json({ error: "Post not found." }, { status: 404 });

  return Response.json({ post });
}

export async function PUT(request: Request, { params }: Props) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { slug: oldSlug } = await params;
    const payload = await request.json();
    const post = normalizePost(payload, blogCategories.filter((category) => category.id !== "all"));
    await savePostToGitHub(post);
    if (oldSlug !== post.slug) {
      await deletePostFromGitHub(oldSlug);
    }
    return Response.json({ post });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not update post." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const { slug } = await params;
  await deletePostFromGitHub(slug);
  return Response.json({ ok: true });
}
