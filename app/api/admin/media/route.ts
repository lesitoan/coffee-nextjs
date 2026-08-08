import { assertAdminApi } from "@/lib/auth/session";
import { saveMediaToGitHub } from "@/lib/admin/content-writer";
import { slugify } from "@/lib/admin/validation";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return file.type.split("/")[1] || "bin";
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawSlug = String(formData.get("slug") || "shared");
    const slug = slugify(rawSlug) || "shared";

    if (!(file instanceof File)) throw new Error("Image file is required.");
    if (!allowedTypes.has(file.type)) throw new Error("Unsupported image type.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5MB or smaller.");

    const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const filename = `${Date.now()}-${baseName}.${extensionFor(file)}`;
    const filePath = `public/uploads/posts/${slug}/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await saveMediaToGitHub(filePath, buffer.toString("base64"));

    return Response.json({
      path: filePath,
      url: `/uploads/posts/${slug}/${filename}`
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not upload media." },
      { status: 400 }
    );
  }
}
