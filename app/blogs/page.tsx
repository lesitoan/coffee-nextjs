import type { Metadata } from "next";
import { BlogsScreen } from "@/screens/blogs";
import { blogCategories } from "@/lib/content/site";
import { getAllPosts } from "@/lib/content/posts";

export const metadata: Metadata = {
  title: "Blogs & Coffee Journal",
  description: "Discover Vietnamese coffee culture, authentic handcrafted recipes, and brewing guides from Classic Coffee Class in Da Nang.",
  alternates: {
    canonical: "/blogs"
  }
};

export default function Page() {
  return <BlogsScreen posts={getAllPosts()} categories={blogCategories} />;
}
