import categories from "@/content/categories.json";
import site from "@/content/site.json";
import testimonials from "@/content/testimonials.json";
import type { BlogCategory } from "@/types/post";
import type { SiteData } from "@/types/site";

export const siteData = site as SiteData;
export const testimonialsData = testimonials as Array<{
  quote: string;
  author: string;
  location: string;
}>;
export const blogCategories = categories as BlogCategory[];

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function toWhatsappUrl(phone: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const international = digits.startsWith("0") ? `84${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

export function getActiveWhatsappItems() {
  const location = siteData.location;

  return [
    {
      label: location.whatsapp,
      href: location.whatsappUrl || toWhatsappUrl(location.whatsapp),
      visible: location.showWhatsapp
    },
    {
      label: location.whatsapp2,
      href: location.whatsapp2Url || toWhatsappUrl(location.whatsapp2),
      visible: location.showWhatsapp2
    }
  ].filter((item) => item.label && item.href && item.visible !== false);
}
