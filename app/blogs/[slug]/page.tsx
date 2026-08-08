import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailScreen } from "@/screens/blog-detail";
import { prepareBlogHtml } from "@/lib/content/html";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/content/posts";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: {
      canonical: `/blogs/${post.slug}`
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: [post.coverImage],
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt
    }
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const prepared = prepareBlogHtml(post.html);
  return (
    <BlogDetailScreen
      post={post}
      relatedPosts={getRelatedPosts(post.slug)}
      html={prepared.html}
      headings={prepared.headings}
    />
  );
}
