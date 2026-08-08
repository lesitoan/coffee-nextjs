import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { getActiveWhatsappItems, siteData } from "@/lib/content/site";

function externalAttrs(url: string) {
  return /^https?:\/\//i.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function SiteFooter() {
  const logo = siteData.brand.logoImage || "/assets/images/logo.png";
  const whatsappItems = getActiveWhatsappItems();
  const contactItems = [
    { icon: MapPin, label: siteData.location.address, href: siteData.location.mapDirectionUrl },
    ...whatsappItems.map((item) => ({ icon: Phone, label: item.label, href: item.href })),
    { icon: Mail, label: siteData.location.email, href: siteData.location.emailUrl },
    { icon: Instagram, label: siteData.location.instagram, href: siteData.location.instagramUrl }
  ];

  const socialItems = [
    { icon: Mail, label: "Gmail", href: siteData.location.emailUrl },
    ...whatsappItems.map((item) => ({ icon: Phone, label: `WhatsApp ${item.label}`, href: item.href })),
    { icon: Instagram, label: "Instagram", href: siteData.location.instagramUrl },
    { icon: MapPin, label: "Directions", href: siteData.location.mapDirectionUrl }
  ];

  return (
    <footer id="site-footer" className="border-t border-stone-800 bg-stone-900 py-12 text-stone-400">
      <div className="section-shell grid grid-cols-1 gap-8 md:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Image src={logo} alt="" width={40} height={40} className="brand-logo h-10 w-10" aria-hidden="true" />
            <span className="font-serif text-2xl font-bold tracking-tight text-white">{siteData.brand.name}</span>
          </div>
          <p className="mb-4 leading-relaxed">{siteData.footer.description}</p>
          <div className="flex flex-wrap gap-3">
            {socialItems.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 transition hover:bg-coffee-600 hover:text-white"
                {...externalAttrs(href)}
              >
                <Icon size={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-bold uppercase tracking-wider text-white">Contact Us</h2>
          <ul className="space-y-3">
            {contactItems.map(({ icon: Icon, label, href }) => (
              <li key={`${label}-${href}`} className="flex gap-3">
                <Icon size={18} className="mt-1 flex-shrink-0 text-coffee-500" aria-hidden="true" />
                <a href={href} className="transition hover:text-white" {...externalAttrs(href)}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-bold uppercase tracking-wider text-white">Class Slots (Daily)</h2>
          <ul className="space-y-2 text-sm">
            {siteData.booking.sessions.map((session: string, index: number) => (
              <li key={session} className="flex justify-between gap-4 border-b border-stone-800 pb-2">
                <span>Session {index + 1}</span>
                <span className="text-right text-white">{session}</span>
              </li>
            ))}
            <li className="pt-2 italic text-stone-500">
              Strict limit of 7 guests per class. Advanced booking is essential.
            </li>
          </ul>
        </div>
      </div>
      <div className="section-shell mt-12 border-t border-stone-800 pt-8 text-center text-sm">
        <p>{siteData.footer.copyright}</p>
      </div>
    </footer>
  );
}
