import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{
    slug?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { slug } = await searchParams;
  if (slug) redirect(`/blogs/${slug}`);
  redirect("/blogs");
}
