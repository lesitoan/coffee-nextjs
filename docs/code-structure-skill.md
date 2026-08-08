# Code Structure Skill

Use this guide whenever creating, moving, or editing source code in this project.

## Goal

Keep the Next.js App Router codebase clean, SEO-friendly, and easy to extend for a source-code-backed blog CMS. The app must deploy to Vercel, use no database, and store blog content and uploaded media in the GitHub repository.

## Core Rules

- `app/` is for routing, layouts, metadata, server data loading, and API route handlers.
- `app/**/page.tsx` must not define page UI directly. It imports and renders a screen from `screens/`.
- `screens/` contains page-specific UI. Each route-level page has its own folder.
- `screens/{screen-name}/index.tsx` exports the complete screen component.
- Components inside a `screens/{screen-name}/` folder are private to that screen unless they are promoted to `components/`.
- `components/` contains reusable components shared by multiple screens.
- `lib/` contains business logic, auth helpers, content loading, GitHub API logic, SEO helpers, validation, sanitization, and editor utilities.
- `content/` contains source-controlled website data and blog posts.
- `public/` contains static assets and uploaded media.

## Preferred Directory Structure

```txt
app/
  layout.tsx
  page.tsx
  globals.css
  sitemap.ts
  robots.ts
  manifest.ts
  book/page.tsx
  histories/page.tsx
  blogs/page.tsx
  blogs/[slug]/page.tsx
  admin/layout.tsx
  admin/page.tsx
  admin/posts/page.tsx
  admin/posts/new/page.tsx
  admin/posts/[slug]/edit/page.tsx
  admin/media/page.tsx
  api/auth/[...nextauth]/route.ts
  api/admin/posts/route.ts
  api/admin/posts/[slug]/route.ts
  api/admin/media/route.ts
  api/revalidate/route.ts

screens/
  home/index.tsx
  book/index.tsx
  histories/index.tsx
  blogs/index.tsx
  blog-detail/index.tsx
  admin-dashboard/index.tsx
  admin-posts/index.tsx
  admin-post-editor/index.tsx
  admin-media/index.tsx

components/
  layout/
  ui/
  seo/
  media/

content/
  site.ts
  testimonials.ts
  categories.ts
  posts/

lib/
  auth/
  content/
  editor/
  github/
  seo/
  utils.ts

public/
  assets/images/
  uploads/posts/

types/
```

## Page Pattern

Route files should stay thin.

```tsx
import { HomeScreen } from "@/screens/home";

export default function Page() {
  return <HomeScreen />;
}
```

For dynamic routes, load data in `app`, then pass it into the screen.

```tsx
import { BlogDetailScreen } from "@/screens/blog-detail";
import { getPostBySlug, getRelatedPosts } from "@/lib/content/posts";

type Props = {
  params: {
    slug: string;
  };
};

export default async function Page({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  const relatedPosts = await getRelatedPosts(params.slug);

  return <BlogDetailScreen post={post} relatedPosts={relatedPosts} />;
}
```

## Screen Pattern

Each screen folder should expose a named screen from `index.tsx`.

```tsx
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";

export function HomeScreen() {
  return (
    <>
      <HeroSection />
      <AboutSection />
    </>
  );
}
```

## Shared Component Promotion Rule

Keep a component inside `screens/{screen-name}/` when it is only used by one screen.

Move it to `components/` only when:

- it is used by at least two screens;
- it represents layout used across the app;
- it is a reusable UI primitive;
- it handles reusable SEO or media behavior.

## Blog Content Storage

Store each post as a JSON file:

```txt
content/posts/{slug}.json
```

Each post should include:

- `id`
- `slug`
- `status`
- `title`
- `excerpt`
- `seoTitle`
- `seoDescription`
- `canonicalPath`
- `category`
- `tags`
- `publishedAt`
- `updatedAt`
- `coverImage`
- `coverAlt`
- `readingTime`
- `tiptapJson`
- `html`

Keep `tiptapJson` for editing and `html` for fast SEO-friendly public rendering.

## Media Storage

Store uploaded post images under:

```txt
public/uploads/posts/{slug}/
```

Use descriptive filenames when possible. Prefer `.webp` or `.avif` for public images. Every content image must have meaningful alt text.

## SEO Rules

- Public content must render on the server whenever possible.
- Blog detail pages must use `generateStaticParams`.
- Blog detail pages must use `generateMetadata`.
- Add canonical URLs for important public pages.
- Add Open Graph and Twitter metadata for pages used in ads.
- Add JSON-LD where relevant:
  - `LocalBusiness`
  - `Course`
  - `BlogPosting`
  - `BreadcrumbList`
  - `FAQPage`
- Use semantic HTML: one `h1`, ordered heading hierarchy, real `p`, `ul`, `ol`, `figure`, and `figcaption`.
- Avoid relying on client-side JavaScript for primary indexable content.
- Use `next/image` for important images with explicit size information.

## Admin And GitHub Rules

- Admin authentication uses GitHub through Auth.js or NextAuth.
- Do not use a database.
- Sessions should be JWT-based.
- Admin access is controlled by `ADMIN_GITHUB_LOGINS`.
- Current development admin login is `lesitoan`.
- Saving a post commits directly to the GitHub repo branch `develop`.
- GitHub tokens must only be used server-side in route handlers or server actions.
- Never expose GitHub write tokens to browser code.

## Editor Rules

The post editor should be built with Tiptap and support rich document editing:

- headings and paragraph styles;
- bold, italic, underline, strike;
- text color and highlight;
- left, center, right, and justify alignment;
- bullet, ordered, and task lists;
- blockquote, code block, and horizontal rule;
- links;
- tables;
- image upload, replace, caption, alt text, and delete;
- undo and redo;
- bubble menu;
- floating menu or slash command when stable.

Always sanitize generated HTML before saving.

## Naming Rules

- Screen folders use kebab-case: `blog-detail`, `admin-post-editor`.
- Screen components use PascalCase ending with `Screen`: `BlogDetailScreen`.
- Shared UI components use PascalCase: `Button`, `SiteHeader`, `JsonLd`.
- Server helper files use descriptive lowercase names: `posts.ts`, `validation.ts`, `commits.ts`.

## Implementation Order

1. Scaffold Next.js App Router, TypeScript, Tailwind, and path alias.
2. Create shared structure: `components/`, `screens/`, `lib/`, `content/`, `types/`.
3. Migrate existing static data into typed modules and post JSON files.
4. Build public screens first: home, book, histories, blogs, blog detail.
5. Add SEO metadata, sitemap, robots, canonical URLs, and JSON-LD.
6. Add GitHub auth and protected admin routes.
7. Build admin list, editor, and media screens.
8. Add GitHub commit-based save, update, delete, and media upload.
9. Run build and fix SEO/performance issues before deployment.
