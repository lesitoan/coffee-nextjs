import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Clock, Newspaper, Tag } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingJsonLd } from "@/lib/seo/jsonLd";
import type { BlogPost } from "@/types/post";
import type { Heading } from "@/lib/content/html";
import { formatDate } from "@/lib/utils";
import { BlogToc } from "./BlogToc";
import { ShareButtons } from "./ShareButtons";

type BlogDetailScreenProps = {
  post: BlogPost;
  relatedPosts: BlogPost[];
  html: string;
  headings: Heading[];
};

function RelatedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex items-start gap-3 border-b border-stone-100 pb-3.5 last:border-0 last:pb-0">
      <Link href={`/blogs/${post.slug}`} className="relative block h-16 w-20 flex-shrink-0 overflow-hidden bg-stone-100 sm:h-[4.5rem] sm:w-24">
        <Image src={post.coverImage} alt={post.coverAlt} fill sizes="96px" className="object-cover transition duration-300 group-hover:scale-105" />
      </Link>
      <div className="min-w-0 flex-1">
        <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-coffee-700">{post.categoryName}</span>
        <h4 className="mb-1 line-clamp-2 font-serif text-xs font-bold leading-snug text-stone-800 transition group-hover:text-coffee-700 sm:text-sm">
          <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
        </h4>
        <span className="flex items-center gap-1 text-[10px] text-stone-400">
          <Clock size={12} aria-hidden="true" />
          {post.readingTime}
        </span>
      </div>
    </article>
  );
}

export function BlogDetailScreen({ post, relatedPosts, html, headings }: BlogDetailScreenProps) {
  return (
    <section id="blog-detail-page" className="min-h-screen bg-white pb-20 pt-24">
      <JsonLd data={blogPostingJsonLd(post)} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-stone-500 sm:text-sm" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-coffee-700">Home</Link>
          <ChevronRight size={12} className="text-stone-400" aria-hidden="true" />
          <Link href="/blogs" className="transition hover:text-coffee-700">Blogs</Link>
          <ChevronRight size={12} className="text-stone-400" aria-hidden="true" />
          <span className="max-w-[200px] truncate font-semibold text-coffee-700 sm:max-w-none">{post.categoryName}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <article className="mb-12">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-stone-500 sm:gap-3">
                <span className="rounded-full border border-coffee-200/60 bg-coffee-50 px-3 py-1 text-xs font-semibold text-coffee-700">
                  {post.categoryName}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} aria-hidden="true" />
                  {formatDate(post.publishedAt)}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} aria-hidden="true" />
                  {post.readingTime}
                </span>
              </div>

              <h1 className="mb-4 font-serif text-xl font-bold leading-snug text-stone-800 sm:text-2xl lg:text-3xl">
                {post.title}
              </h1>
              <p className="mb-6 border-l-4 border-coffee-600 py-1 pl-4 text-sm font-light italic leading-relaxed text-stone-600 sm:text-base">
                {post.excerpt}
              </p>

              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-4 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} aria-hidden="true" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} aria-hidden="true" />
                    {post.readingTime}
                  </span>
                </div>
                <ShareButtons />
              </div>

              <div className="mb-8 lg:hidden">
                <BlogToc headings={headings} />
              </div>

              <div className="blog-hero-image relative mb-8 aspect-video overflow-hidden bg-stone-100 shadow-sm sm:aspect-[16/9]">
                <Image src={post.coverImage} alt={post.coverAlt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>

              <div className="blog-content mb-8 max-w-none text-stone-800" dangerouslySetInnerHTML={{ __html: html }} />

              {post.tags.length ? (
                <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-6 text-xs">
                  <span className="mr-1 inline-flex items-center gap-1 font-semibold text-stone-500">
                    <Tag size={14} aria-hidden="true" />
                    Tags:
                  </span>
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-stone-200/60 bg-stone-100 px-3 py-1 text-stone-600">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>

            <div className="relative mb-10 overflow-hidden rounded-lg bg-stone-900 p-5 text-white shadow-lg sm:rounded-3xl sm:p-10">
              <div className="relative z-10 max-w-2xl">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-coffee-400 sm:text-sm">
                  Hands-on Experience
                </span>
                <h2 className="mb-3 font-serif text-xl font-bold leading-tight sm:text-3xl">
                  Handcraft 4 Authentic Vietnamese Coffees With Our Baristas
                </h2>
                <p className="mb-6 text-xs leading-relaxed text-stone-300 sm:text-sm">
                  Beyond reading, join our hands-on 90-minute workshop in Da Nang to brew phin coffee, whisk egg cream, and savor your creations!
                </p>
                <Link href="/book" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coffee-500 px-6 py-3 text-center text-xs font-semibold text-white shadow-md transition hover:bg-coffee-600 sm:w-auto sm:text-sm">
                  <span>Book Your Class Now</span>
                </Link>
              </div>
            </div>
          </div>

          <aside className="w-full lg:col-span-5">
            <div className="space-y-6 pr-1 lg:sticky lg:top-28 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <div className="hidden lg:block">
                <BlogToc headings={headings} />
              </div>
              <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-sm sm:rounded-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                  <h3 className="flex items-center gap-2 font-serif text-base font-bold text-stone-800 sm:text-lg">
                    <Newspaper size={17} className="text-coffee-700" aria-hidden="true" />
                    <span>More Stories</span>
                  </h3>
                  <Link href="/blogs" className="text-xs font-semibold text-coffee-700 hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {relatedPosts.map((relatedPost) => (
                    <RelatedPostCard key={relatedPost.slug} post={relatedPost} />
                  ))}
                </div>
              </div>
              <div className="hidden overflow-hidden rounded-lg bg-stone-900 p-6 text-white shadow-md sm:rounded-2xl lg:block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-coffee-400">Da Nang Workshop</span>
                <h4 className="mb-2 font-serif text-lg font-bold leading-snug">Hands-on 90-Min Coffee Class</h4>
                <p className="mb-5 text-xs leading-relaxed text-stone-300">
                  Handcraft 4 authentic Vietnamese coffees with experienced Baristas in Da Nang.
                </p>
                <Link href="/book" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coffee-500 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-coffee-600">
                  <span>Book Your Class</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
