import Image from "next/image";
import { Quote } from "lucide-react";
import { siteData } from "@/lib/content/site";

export function AboutSection() {
  return (
    <section id="about" className="soft-bg py-20">
      <div className="section-shell">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">
              {siteData.about.eyebrow}
            </span>
            <h2 className="mb-6 font-serif text-3xl font-bold text-coffee-800 md:text-4xl">{siteData.about.title}</h2>
            {siteData.about.paragraphs.map((paragraph: string) => (
              <p key={paragraph} className="mb-4 text-lg leading-relaxed text-stone-600">
                {paragraph}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-8 border-t border-stone-100 pt-8">
              {siteData.about.stats.map((stat: { value: string; label: string }) => (
                <div key={stat.label}>
                  <p className="font-serif text-3xl font-bold text-coffee-600">{stat.value}</p>
                  <p className="mt-1 text-sm uppercase tracking-wider text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Image
              src={siteData.about.image.url}
              alt={siteData.about.image.alt}
              width={720}
              height={900}
              className="h-[500px] w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 hidden max-w-xs rounded-2xl bg-coffee-800 p-6 text-white shadow-xl md:block">
              <Quote className="mb-2 text-coffee-400" aria-hidden="true" />
              <p className="font-serif italic">{siteData.about.quote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
