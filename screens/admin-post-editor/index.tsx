"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setPostSaveLock } from "@/lib/admin/post-save-lock";
import type { BlogCategory, BlogPost } from "@/types/post";
import { RichPostEditor } from "./RichPostEditor";

type AdminPostEditorScreenProps = {
  post?: BlogPost | null;
  categories: BlogCategory[];
};

const emptyPost: Partial<BlogPost> = {
  status: "published",
  title: "",
  slug: "",
  excerpt: "",
  seoTitle: "",
  seoDescription: "",
  category: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: "/assets/images/learn-phin-coffee.avif",
  coverAlt: "",
  readingTime: "5 min read",
  featured: false,
  tags: [],
  html: "<p>Write your post content here.</p>"
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseReadingMinutes(value?: string) {
  const parsed = Number(String(value || "").match(/\d+/)?.[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

export function AdminPostEditorScreen({ post, categories }: AdminPostEditorScreenProps) {
  const router = useRouter();
  const initial = post || emptyPost;
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editorUploading, setEditorUploading] = useState(false);
  const [coverImage, setCoverImage] = useState(initial.coverImage || "");
  const [title, setTitle] = useState(initial.title || "");
  const [slug, setSlug] = useState(initial.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.slug));
  const [readingMinutes, setReadingMinutes] = useState(parseReadingMinutes(initial.readingTime));
  const [tags, setTags] = useState<string[]>(initial.tags || []);
  const [tagInput, setTagInput] = useState("");
  const uploadBusy = coverUploading || editorUploading;

  function updateTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function updateSlug(value: string) {
    setSlug(slugify(value));
    setSlugEdited(true);
  }

  function addTag() {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    if (tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
      toast.info("Tag này đã tồn tại.");
      setTagInput("");
      return;
    }
    setTags((currentTags) => [...currentTags, nextTag]);
    setTagInput("");
  }

  async function uploadCover(file: File) {
    const safeSlug = slug || "draft";
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", safeSlug);
    setStatus("Uploading image to GitHub...");
    setError("");
    setCoverUploading(true);
    const toastId = toast.loading("Đang upload cover image...");

    try {
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not upload image.");
      setCoverImage(result.url);
      setStatus("Image uploaded. Save the post to use it.");
      toast.success("Cover image đã upload xong.", { id: toastId });
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Could not upload image.";
      setError(message);
      setStatus("");
      toast.error(message, { id: toastId });
      throw uploadError;
    } finally {
      setCoverUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploadBusy) {
      toast.warning("Đang upload ảnh, vui lòng chờ hoàn tất rồi hãy lưu.");
      return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      id: post?.id,
      title,
      slug,
      status: String(formData.get("status") || "published"),
      excerpt: String(formData.get("excerpt") || ""),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
      category: String(formData.get("category") || ""),
      publishedAt: String(formData.get("publishedAt") || ""),
      coverImage,
      coverAlt: String(formData.get("coverAlt") || ""),
      readingTime: `${Math.max(1, readingMinutes)} min read`,
      featured: formData.get("featured") === "on",
      tags,
      html: String(formData.get("html") || ""),
      tiptapJson: post?.tiptapJson ?? null
    };

    setSaving(true);
    setError("");
    setStatus("Saving to GitHub...");
    const toastId = toast.loading("Đang lưu bài viết...");

    try {
      const endpoint = post ? `/api/admin/posts/${post.slug}` : "/api/admin/posts";
      const response = await fetch(endpoint, {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save post.");
      setStatus(`Saved ${result.post.slug} to GitHub. Pull latest source locally after the commit finishes.`);
      setPostSaveLock(result.post.slug);
      toast.success("Đã lưu bài viết. Vui lòng chờ deploy hoàn tất trước khi sửa lại.", { id: toastId });
      router.push("/admin/posts");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save post.";
      setError(message);
      setStatus("");
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!post) return;
    if (!window.confirm("Delete this post from GitHub?")) return;

    setSaving(true);
    setError("");
    setStatus("Deleting from GitHub...");
    const toastId = toast.loading("Đang xoá bài viết...");
    try {
      const response = await fetch(`/api/admin/posts/${post.slug}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete post.");
      setStatus("Deleted on GitHub. Pull latest source locally to remove it from this dev copy.");
      toast.success("Đã xoá bài viết.", { id: toastId });
      router.push("/admin/posts");
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Could not delete post.";
      setError(message);
      setStatus("");
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">{post ? "Edit Post" : "New Post"}</p>
            <h2 className="font-serif text-2xl font-bold text-stone-900">{post ? post.title : "Create a post"}</h2>
          </div>
          <div className="flex gap-2">
            {post ? (
              <button type="button" onClick={deletePost} disabled={saving} className="rounded-sm border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60">
                Delete
              </button>
            ) : null}
            <button disabled={saving || uploadBusy} className="rounded-sm bg-coffee-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-coffee-800 disabled:opacity-60">
              {uploadBusy ? "Uploading image..." : saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error ? <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
        {status ? <div className="mb-5 rounded-sm border border-coffee-200 bg-coffee-50 p-3 text-sm font-medium text-coffee-800">{status}</div> : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-stone-700">Title</span>
            <input name="title" value={title} onChange={(event) => updateTitle(event.target.value)} required className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Slug</span>
            <input name="slug" value={slug} onChange={(event) => updateSlug(event.target.value)} placeholder="egg-coffee-secrets" className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Status</span>
            <select name="status" defaultValue={initial.status} className="w-full rounded-sm border border-stone-300 px-4 py-3">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Category</span>
            <select name="category" defaultValue={initial.category} required className="w-full rounded-sm border border-stone-300 px-4 py-3">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Published At</span>
            <input name="publishedAt" type="date" defaultValue={initial.publishedAt} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Reading Time</span>
            <div className="flex overflow-hidden rounded-sm border border-stone-300 bg-white">
              <input
                name="readingTimeMinutes"
                type="number"
                min={1}
                value={readingMinutes}
                onChange={(event) => setReadingMinutes(Math.max(1, Number(event.target.value) || 1))}
                className="w-full px-4 py-3 outline-none"
              />
              <span className="flex items-center border-l border-stone-200 px-4 text-sm font-semibold text-stone-500">min read</span>
            </div>
          </label>
          <div>
            <span className="mb-2 block text-sm font-bold text-stone-700">Tags</span>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                className="w-full rounded-sm border border-stone-300 px-4 py-3"
                placeholder="Egg Coffee"
              />
              <button type="button" onClick={addTag} className="rounded-sm border border-stone-300 px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-coffee-700 hover:text-coffee-700">
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))}
                  className="rounded-full bg-coffee-50 px-3 py-1 text-xs font-bold text-coffee-800 transition hover:bg-red-50 hover:text-red-700"
                  title="Remove tag"
                >
                  {tag} x
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-sm border border-stone-200 px-4 py-3">
            <input name="featured" type="checkbox" defaultChecked={initial.featured} />
            <span className="text-sm font-bold text-stone-700">Featured story</span>
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-stone-700">Excerpt</span>
            <textarea name="excerpt" defaultValue={initial.excerpt} rows={3} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
        </div>
      </div>

      <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-xl font-bold text-stone-900">SEO</h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">SEO Title</span>
            <input name="seoTitle" defaultValue={initial.seoTitle} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Cover Alt</span>
            <input name="coverAlt" defaultValue={initial.coverAlt} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-stone-700">SEO Description</span>
            <textarea name="seoDescription" defaultValue={initial.seoDescription} rows={3} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <div className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-stone-700">Cover Image</span>
            <div className="flex flex-col gap-3 md:flex-row">
              <input value={coverImage} onChange={(event) => setCoverImage(event.target.value)} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
              <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadCover(event.target.files[0]).catch(() => undefined)} className="rounded-sm border border-stone-300 px-4 py-3 text-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-serif text-xl font-bold text-stone-900">Content Editor</h3>
        <p className="mb-4 text-sm text-stone-500">
          Write and format the public SEO HTML. Images uploaded here are committed to GitHub immediately.
        </p>
        <RichPostEditor
          name="html"
          initialHtml={initial.html}
          slug={slug}
          onStatus={setStatus}
          onError={setError}
          onUploadingChange={setEditorUploading}
        />
      </div>
    </form>
  );
}
