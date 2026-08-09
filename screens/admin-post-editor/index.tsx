"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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

export function AdminPostEditorScreen({ post, categories }: AdminPostEditorScreenProps) {
  const router = useRouter();
  const initial = post || emptyPost;
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState(initial.coverImage || "");
  const [slug, setSlug] = useState(initial.slug || "");

  async function uploadCover(file: File) {
    const safeSlug = slug || "draft";
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", safeSlug);
    setStatus("Uploading image to GitHub...");
    setError("");

    const response = await fetch("/api/admin/media", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not upload image.");
    setCoverImage(result.url);
    setStatus("Image uploaded. Save the post to use it.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      id: post?.id,
      title: String(formData.get("title") || ""),
      slug: String(formData.get("slug") || ""),
      status: String(formData.get("status") || "published"),
      excerpt: String(formData.get("excerpt") || ""),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
      category: String(formData.get("category") || ""),
      publishedAt: String(formData.get("publishedAt") || ""),
      coverImage,
      coverAlt: String(formData.get("coverAlt") || ""),
      readingTime: String(formData.get("readingTime") || ""),
      featured: formData.get("featured") === "on",
      tags: String(formData.get("tags") || ""),
      html: String(formData.get("html") || ""),
      tiptapJson: post?.tiptapJson ?? null
    };

    setSaving(true);
    setError("");
    setStatus("Saving to GitHub...");

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
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save post.");
      setStatus("");
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
    try {
      const response = await fetch(`/api/admin/posts/${post.slug}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete post.");
      setStatus("Deleted on GitHub. Pull latest source locally to remove it from this dev copy.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete post.");
      setStatus("");
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
            <button disabled={saving} className="rounded-sm bg-coffee-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-coffee-800 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {error ? <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
        {status ? <div className="mb-5 rounded-sm border border-coffee-200 bg-coffee-50 p-3 text-sm font-medium text-coffee-800">{status}</div> : null}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-stone-700">Title</span>
            <input name="title" defaultValue={initial.title} required className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Slug</span>
            <input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="egg-coffee-secrets" className="w-full rounded-sm border border-stone-300 px-4 py-3" />
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
            <input name="readingTime" defaultValue={initial.readingTime} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-stone-700">Tags, comma separated</span>
            <input name="tags" defaultValue={initial.tags?.join(", ")} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
          </label>
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
              <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadCover(event.target.files[0]).catch((uploadError) => setError(uploadError.message))} className="rounded-sm border border-stone-300 px-4 py-3 text-sm" />
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
        />
      </div>
    </form>
  );
}
