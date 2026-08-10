import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
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
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
