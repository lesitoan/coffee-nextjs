import Image from "next/image";
import { Leaf, Users, UserRoundCheck, Cookie } from "lucide-react";
import { siteData } from "@/lib/content/site";

const icons = [Leaf, Users, UserRoundCheck, Cookie];

export function WhyUsSection() {
  return (
    <section id="why-us" className="soft-bg py-20">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {siteData.whyUs.images.map((image: { url: string; alt: string }, index: number) => (
              <Image
                key={image.url}
                src={image.url}
                alt={image.alt}
                width={500}
                height={500}
                className={`h-48 w-full rounded-2xl object-cover md:h-64 ${index === 1 ? "mt-8" : ""}`}
              />
            ))}
          </div>
          <div>
            {siteData.whyUs.eyebrow ? (
              <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">
                {siteData.whyUs.eyebrow}
              </span>
            ) : null}
            <h2 className="mb-8 font-serif text-3xl font-bold text-stone-800 md:text-4xl">{siteData.whyUs.title}</h2>
            <div className="space-y-6">
              {siteData.whyUs.reasons.map((reason: any, index: number) => {
                const Icon = icons[index] || Leaf;
                return (
                  <article key={reason.title} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <Icon className="text-coffee-600" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold text-stone-800">{reason.title}</h3>
                      <p className="leading-relaxed text-stone-600">{reason.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
