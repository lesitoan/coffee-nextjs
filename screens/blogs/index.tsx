"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Clock, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BlogCategory, BlogPost } from "@/types/post";
import { formatDate } from "@/lib/utils";

type BlogsScreenProps = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:gap-5 lg:grid-cols-3 lg:gap-8">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl border border-stone-200/80 bg-white p-3.5 shadow-md sm:p-5">
          <div className="mb-4 aspect-[16/10] animate-pulse rounded-lg bg-stone-200" />
          <div className="mb-3 h-3 w-1/3 animate-pulse rounded bg-stone-200" />
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-stone-200" />
          <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-stone-200" />
        </div>
      ))}
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-row overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:rounded-2xl lg:flex-col">
      <Link href={`/blogs/${post.slug}`} className="relative block aspect-square w-28 flex-shrink-0 overflow-hidden bg-stone-100 sm:aspect-[4/3] sm:w-44 md:w-52 lg:aspect-[16/10] lg:w-full">
        <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(min-width: 1024px) 33vw, 40vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 hidden rounded-full border border-stone-200/60 bg-white/90 px-3 py-1 text-xs font-semibold text-coffee-800 shadow-sm backdrop-blur sm:inline-block">
          {post.categoryName}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5 lg:p-6">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-stone-400 sm:mb-2 sm:gap-2 sm:text-xs">
            <span className="rounded border border-coffee-200/60 bg-coffee-50 px-2 py-0.5 text-[9.5px] font-semibold text-coffee-700 sm:hidden">
              {post.categoryName}
            </span>
            <span className="hidden sm:inline-flex sm:items-center sm:gap-1">
              <Calendar size={13} aria-hidden="true" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="hidden sm:inline-block">•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden="true" />
              {post.readingTime}
            </span>
          </div>
          <h3 className="mb-1 line-clamp-2 font-serif text-[12.5px] font-bold leading-snug text-stone-800 transition group-hover:text-coffee-700 sm:mb-2 sm:text-base lg:text-lg">
            <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="mb-2 line-clamp-2 text-[11px] leading-snug text-stone-500 sm:mb-3 sm:line-clamp-3 sm:text-sm sm:leading-relaxed">
            {post.excerpt}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-stone-100 pt-1.5 text-xs text-stone-500 sm:pt-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-400 sm:text-xs">
            <Calendar size={13} aria-hidden="true" />
            {formatDate(post.publishedAt)}
          </span>
          <Link href={`/blogs/${post.slug}`} className="flex items-center gap-1 whitespace-nowrap text-[10px] font-semibold text-coffee-700 transition duration-200 group-hover:translate-x-1 sm:text-xs">
            Read More <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BlogsScreen({ posts, categories }: BlogsScreenProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const featuredPost = posts.find((post) => post.featured);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setSearchQuery(inputValue);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, posts, searchQuery]);

  return (
    <section id="blogs-page" className="blogs-page-bg min-h-screen pb-20 pt-20">
      <div className="mb-10 w-full overflow-hidden px-4 py-12 text-center text-white shadow-sm sm:px-8 sm:pb-16 sm:pt-20" style={{ backgroundImage: "linear-gradient(rgba(43, 27, 19, 0.82), rgba(43, 27, 19, 0.82)), url('/assets/images/vintage-newspaper-bg.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-coffee-300 backdrop-blur-sm sm:text-sm">
            Classic Coffee Journal
          </span>
          <h1 className="mb-4 font-serif text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl">
            Stories, Recipes & Culture
          </h1>
          <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-stone-200 sm:text-base md:text-lg">
            Discover handcrafted Vietnamese coffee brewing, authentic local culture, and inspiring stories from Classic Coffee Class.
          </p>
        </div>
      </div>

      <div className="section-shell">
        {featuredPost ? (
          <div className="mb-10 overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-sm transition duration-300 hover:shadow-md sm:rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative min-h-[300px] lg:col-span-7 lg:min-h-[420px]">
                <Image src={featuredPost.coverImage} alt={featuredPost.coverAlt} fill className="object-cover" priority sizes="(min-width: 1024px) 58vw, 100vw" />
                <span className="absolute left-4 top-4 rounded-full bg-coffee-700 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow">
                  Featured Story
                </span>
              </div>
              <div className="flex flex-col justify-center bg-white p-4 sm:p-8 lg:col-span-5 lg:p-10">
                <div className="mb-3 flex items-center gap-3 text-xs text-stone-500 sm:text-sm">
                  <span className="rounded-full border border-coffee-200/60 bg-coffee-50 px-3 py-1 font-semibold text-coffee-700">
                    {featuredPost.categoryName}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} aria-hidden="true" />
                    {featuredPost.readingTime}
                  </span>
                </div>
                <h2 className="mb-3 font-serif text-2xl font-bold leading-snug text-stone-800 transition hover:text-coffee-700 sm:text-3xl">
                  <Link href={`/blogs/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <p className="mb-6 text-sm leading-relaxed text-stone-600 sm:text-base">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                    <Calendar size={14} aria-hidden="true" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                  <Link href={`/blogs/${featuredPost.slug}`} className="inline-flex items-center gap-2 rounded-full bg-coffee-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee-800">
                    <span>Read Story</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 border-t border-stone-200/80 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex min-w-0 max-w-full snap-x snap-mandatory items-center gap-2.5 overflow-x-auto scroll-smooth px-1 py-2.5">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 snap-center rounded-full border px-4 py-2 text-xs transition-all duration-300 sm:text-sm ${
                  activeCategory === category.id
                    ? "scale-105 border-coffee-700 bg-coffee-700 font-semibold text-white shadow-md ring-2 ring-coffee-600/25"
                    : "border-stone-300/80 bg-white font-medium text-stone-700 shadow-sm hover:bg-coffee-50 hover:text-coffee-700"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="relative w-full flex-shrink-0 p-0.5 lg:w-72">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              <Search className={isSearching ? "animate-spin text-coffee-600" : ""} size={16} aria-hidden="true" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Search blogs..."
              className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-9 pr-8 text-sm text-stone-800 shadow-sm transition-all duration-200 placeholder:text-stone-400 hover:border-coffee-500 focus:border-coffee-600 focus:outline-none focus:ring-2 focus:ring-coffee-600/20"
            />
            {inputValue ? (
              <button type="button" onClick={() => setInputValue("")} className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600" aria-label="Clear search">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-stone-800 sm:text-2xl">
            {activeCategory === "all" ? "All Stories" : categories.find((item) => item.id === activeCategory)?.label || "Blogs"}
            <span className="font-sans text-base font-normal text-stone-400"> ({filteredPosts.length})</span>
          </h3>
        </div>

        {isSearching ? <SkeletonCards /> : filteredPosts.length ? (
          <div className="grid grid-cols-1 gap-3.5 sm:gap-5 lg:grid-cols-3 lg:gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="mx-auto my-8 max-w-lg rounded-2xl border border-stone-200/80 bg-white p-10 text-center shadow-sm">
            <h3 className="mb-2 font-serif text-xl font-bold text-stone-800">No Blog Posts Found</h3>
            <p className="mb-6 text-sm text-stone-600">No articles match your search keyword "{searchQuery}". Please try another search term.</p>
            <button type="button" onClick={() => { setActiveCategory("all"); setInputValue(""); }} className="rounded-full bg-coffee-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-coffee-800">
              View All Stories
            </button>
          </div>
        )}

        <div className="mb-16 mt-14 overflow-hidden rounded-lg bg-stone-900 p-5 text-white shadow-lg sm:rounded-3xl sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-coffee-400 sm:text-sm">
              Hands-on Experience
            </span>
            <h2 className="mb-4 font-serif text-2xl font-bold leading-tight sm:text-4xl">
              Handcraft 4 Authentic Vietnamese Coffees With Our Baristas
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-stone-300 sm:text-base">
              Beyond reading, join our hands-on 90-minute workshop in Da Nang to brew phin coffee, whisk egg cream, and savor your creations!
            </p>
            <Link href="/book" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coffee-500 px-7 py-3.5 text-center font-semibold text-white shadow-md transition hover:bg-coffee-600 sm:w-auto">
              <span>Book Your Class Now</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
