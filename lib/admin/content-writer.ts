import "server-only";

import type { BlogCategory, BlogPost } from "@/types/post";
import { deleteGitHubFile, putGitHubBase64File, putGitHubTextFile } from "@/lib/github/client";

export async function savePostToGitHub(post: BlogPost) {
  return putGitHubTextFile(
    `content/posts/${post.slug}.json`,
    `${JSON.stringify(post, null, 2)}\n`,
    `content: save post ${post.slug}`
  );
}

export async function deletePostFromGitHub(slug: string) {
  return deleteGitHubFile(`content/posts/${slug}.json`, `content: delete post ${slug}`);
}

export async function saveCategoriesToGitHub(categories: BlogCategory[]) {
  return putGitHubTextFile(
    "content/categories.json",
    `${JSON.stringify(categories, null, 2)}\n`,
    "content: update blog categories"
  );
}

export async function saveMediaToGitHub(filePath: string, base64Content: string) {
  return putGitHubBase64File(filePath, base64Content, `content: upload media ${filePath}`);
}
