export type BlogCategory = {
  id: string;
  slug?: string;
  label: string;
  icon?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
  status?: "active" | "hidden";
};

export type BlogPost = {
  id: string;
  slug: string;
  status: "published" | "draft";
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  category: string;
  categoryName: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: string;
  coverAlt: string;
  readingTime: string;
  featured: boolean;
  tags: string[];
  tiptapJson: unknown;
  html: string;
};
