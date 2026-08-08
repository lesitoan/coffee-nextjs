import type { Metadata } from "next";
import { Suspense } from "react";
import { BookScreen } from "@/screens/book";
import { siteData } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Book",
  description: siteData.booking.description,
  alternates: {
    canonical: "/book"
  }
};

export default function Page() {
  return (
    <Suspense>
      <BookScreen />
    </Suspense>
  );
}
