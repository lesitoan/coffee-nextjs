import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getSiteUrl, siteData } from "@/lib/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-merriweather",
  display: "swap",
});

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
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
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
