import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getSiteUrl, siteData } from "@/lib/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteData.meta.title,
    template: `%s | ${siteData.brand.fullName}`
  },
  description: siteData.meta.description,
  icons: {
    icon: siteData.brand.logoImage || "/assets/images/logo.png",
    shortcut: siteData.brand.logoImage || "/assets/images/logo.png",
    apple: siteData.brand.logoImage || "/assets/images/logo.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans text-stone-800 antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <BackToTop />
        <ScrollReveal />
      </body>
    </html>
  );
}
