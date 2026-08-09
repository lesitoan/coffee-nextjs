"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BlogCategory } from "@/types/post";

type AdminCategoryEditorScreenProps = {
  category?: BlogCategory | null;
};

export function AdminCategoryEditorScreen({ category }: AdminCategoryEditorScreenProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      id: category?.id || String(formData.get("id") || ""),
      label: String(formData.get("label") || ""),
      icon: String(formData.get("icon") || ""),
      description: String(formData.get("description") || ""),
      seoTitle: String(formData.get("seoTitle") || ""),
      seoDescription: String(formData.get("seoDescription") || ""),
      order: Number(formData.get("order") || 0),
      status: String(formData.get("status") || "active")
    };

    setSaving(true);
    setError("");
    setStatus("Saving to GitHub...");
    const toastId = toast.loading("Đang lưu category...");
    try {
      const response = await fetch(category ? `/api/admin/categories/${category.id}` : "/api/admin/categories", {
        method: category ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save category.");
      setStatus("Saved to GitHub. Pull latest source locally after the commit finishes.");
      toast.success("Đã lưu category.", { id: toastId });
      router.refresh();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Could not save category.";
      setError(message);
      setStatus("");
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory() {
    if (!category) return;
    if (!window.confirm("Delete this category from GitHub?")) return;

    setSaving(true);
    setError("");
    setStatus("Deleting from GitHub...");
    const toastId = toast.loading("Đang xoá category...");
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete category.");
      setStatus("Deleted on GitHub. Pull latest source locally to remove it from this dev copy.");
      toast.success("Đã xoá category.", { id: toastId });
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Could not delete category.";
      setError(message);
      setStatus("");
      toast.error(message, { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-sm border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">{category ? "Edit Category" : "New Category"}</p>
          <h2 className="font-serif text-2xl font-bold text-stone-900">{category?.label || "Create a category"}</h2>
        </div>
        <div className="flex gap-2">
          {category ? (
            <button type="button" onClick={deleteCategory} disabled={saving} className="rounded-sm border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60">
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
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">Label</span>
          <input name="label" defaultValue={category?.label} required className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">Slug / ID</span>
          <input name="id" defaultValue={category?.id} disabled={Boolean(category)} className="w-full rounded-sm border border-stone-300 px-4 py-3 disabled:bg-stone-100" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">Icon class</span>
          <input name="icon" defaultValue={category?.icon || "fa-solid fa-newspaper"} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">Order</span>
          <input name="order" type="number" defaultValue={category?.order || 1} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">Status</span>
          <select name="status" defaultValue={category?.status || "active"} className="w-full rounded-sm border border-stone-300 px-4 py-3">
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold text-stone-700">Description</span>
          <textarea name="description" defaultValue={category?.description} rows={3} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">SEO Title</span>
          <input name="seoTitle" defaultValue={category?.seoTitle} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
        <label>
          <span className="mb-2 block text-sm font-bold text-stone-700">SEO Description</span>
          <input name="seoDescription" defaultValue={category?.seoDescription} className="w-full rounded-sm border border-stone-300 px-4 py-3" />
        </label>
      </div>
    </form>
  );
}
