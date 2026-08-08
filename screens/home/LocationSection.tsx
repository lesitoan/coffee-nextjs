import { Instagram, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { getActiveWhatsappItems, siteData } from "@/lib/content/site";

function externalAttrs(url: string) {
  return /^https?:\/\//i.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function LocationSection() {
  const contactItems = [
    { icon: MapPin, label: siteData.location.address, href: siteData.location.mapDirectionUrl },
    ...getActiveWhatsappItems().map((item) => ({ icon: Phone, label: item.label, href: item.href })),
    { icon: Mail, label: siteData.location.email, href: siteData.location.emailUrl },
    { icon: Instagram, label: siteData.location.instagram, href: siteData.location.instagramUrl }
  ];

  return (
    <section id="location" className="soft-bg py-20">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-100 bg-white p-8 shadow-sm md:p-10">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">Location</span>
            <h2 className="mb-4 font-serif text-3xl font-bold text-stone-800 md:text-4xl">{siteData.location.title}</h2>
            <p className="mb-8 text-lg leading-relaxed text-stone-600">{siteData.location.description}</p>
            <div className="mb-8 space-y-5">
              {contactItems.map(({ icon: Icon, label, href }) => (
                <a key={`${label}-${href}`} href={href} className="flex gap-4 text-stone-700 transition hover:text-coffee-700" {...externalAttrs(href)}>
                  <Icon className="mt-1 flex-shrink-0 text-coffee-600" size={18} aria-hidden="true" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
            <a
              href={siteData.location.mapDirectionUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee-700 px-6 py-3 font-semibold text-white transition hover:bg-coffee-800"
              {...externalAttrs(siteData.location.mapDirectionUrl)}
            >
              <Navigation size={18} aria-hidden="true" />
              Get Directions
            </a>
          </div>
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
            <iframe
              className="map-frame h-full w-full"
              src={siteData.location.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              title={`Map to ${siteData.brand.fullName}`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
