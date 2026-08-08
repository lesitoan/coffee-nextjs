import type { BlogPost } from "@/types/post";
import type { SiteData } from "@/types/site";
import { getSiteUrl } from "@/lib/content/site";

export function localBusinessJsonLd(siteData: SiteData) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteData.brand.fullName,
    url: siteUrl,
    image: `${siteUrl}${siteData.brand.logoImage}`,
    email: siteData.location.email,
    telephone: siteData.location.phone,
    address: siteData.location.address,
    sameAs: [siteData.location.instagramUrl].filter(Boolean)
  };
}

export function courseJsonLd(siteData: SiteData) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Vietnamese Coffee Class in Da Nang",
    description: siteData.hero.description,
    provider: {
      "@type": "Organization",
      name: siteData.brand.fullName,
      sameAs: getSiteUrl()
    }
  };
}

export function blogPostingJsonLd(post: BlogPost) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${siteUrl}/blogs/${post.slug}`
  };
}
