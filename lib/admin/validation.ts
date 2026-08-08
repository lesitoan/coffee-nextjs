import type { BlogCategory, BlogPost } from "@/types/post";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/\s(href|src)=["']javascript:[^"']*["']/gi, "");
}

export function normalizePost(input: Partial<BlogPost>, categories: BlogCategory[]) {
  const title = String(input.title || "").trim();
  const slug = slugify(String(input.slug || title));
  const category = String(input.category || "").trim();
  const matchedCategory = categories.find((item) => item.id === category || item.slug === category);
  const now = new Date().toISOString().slice(0, 10);

  if (!title) throw new Error("Title is required.");
  if (!slug) throw new Error("Slug is required.");
  if (!matchedCategory) throw new Error("Category is required.");

  const html = sanitizeHtml(String(input.html || ""));
  if (!html.trim()) throw new Error("HTML content is required.");

  return {
    id: input.id || slug,
    slug,
    status: input.status === "draft" ? "draft" : "published",
    title,
    excerpt: String(input.excerpt || "").trim(),
    seoTitle: String(input.seoTitle || title).trim(),
    seoDescription: String(input.seoDescription || input.excerpt || "").trim(),
    canonicalPath: `/blogs/${slug}`,
    category: matchedCategory.id,
    categoryName: matchedCategory.label,
    publishedAt: String(input.publishedAt || now),
    updatedAt: now,
    coverImage: String(input.coverImage || "/assets/images/learn-phin-coffee.avif").trim(),
    coverAlt: String(input.coverAlt || title).trim(),
    readingTime: String(input.readingTime || "5 min read").trim(),
    featured: Boolean(input.featured),
    tags: Array.isArray(input.tags)
      ? input.tags.map(String).map((tag) => tag.trim()).filter(Boolean)
      : String(input.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
    tiptapJson: input.tiptapJson ?? null,
    html
  } satisfies BlogPost;
}

export function normalizeCategory(input: Partial<BlogCategory>, existing: BlogCategory[] = []) {
  const label = String(input.label || "").trim();
  const id = slugify(String(input.id || input.slug || label));
  if (!label) throw new Error("Category label is required.");
  if (!id) throw new Error("Category slug is required.");

  return {
    id,
    slug: id,
    label,
    icon: input.icon || "fa-solid fa-newspaper",
    description: String(input.description || "").trim(),
    seoTitle: String(input.seoTitle || label).trim(),
    seoDescription: String(input.seoDescription || input.description || "").trim(),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : existing.length + 1,
    status: input.status === "hidden" ? "hidden" : "active"
  } satisfies BlogCategory;
}
