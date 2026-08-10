"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BackToTop } from "@/components/ui/BackToTop";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <main>{children}</main>
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <BackToTop />
      <ScrollReveal />
      <Toaster richColors position="top-right" />
    </>
  );
}
