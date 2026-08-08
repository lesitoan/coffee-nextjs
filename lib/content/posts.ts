import fs from "node:fs";
import path from "node:path";
import type { BlogPost } from "@/types/post";

const postsDir = path.join(process.cwd(), "content", "posts");

export function getAllPosts(options: { includeDrafts?: boolean } = {}): BlogPost[] {
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
      return JSON.parse(raw) as BlogPost;
    })
    .filter((post) => options.includeDrafts || post.status === "published")
    .sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

export function getPostBySlug(slug: string) {
  return getAllPosts({ includeDrafts: true }).find((post) => post.slug === slug || post.id === slug) ?? null;
}

export function getFeaturedPost() {
  return getAllPosts().find((post) => post.featured) ?? getAllPosts()[0] ?? null;
}

export function getRelatedPosts(slug: string, limit = 5) {
  return getAllPosts().filter((post) => post.slug !== slug).slice(0, limit);
}
