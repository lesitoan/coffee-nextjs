import type { Metadata } from "next";
import { HomeScreen } from "@/screens/home";
import { siteData } from "@/lib/content/site";

export const metadata: Metadata = {
  title: siteData.meta.title,
  description: siteData.meta.description,
  alternates: {
    canonical: "/"
  }
};

export default function Page() {
  return <HomeScreen />;
}
