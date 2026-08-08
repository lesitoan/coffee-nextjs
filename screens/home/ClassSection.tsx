import Image from "next/image";
import { siteData } from "@/lib/content/site";

export function ClassSection() {
  return (
    <section id="class" className="soft-bg py-20">
      <div className="section-shell">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          {siteData.classSection.eyebrow ? (
            <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">
              {siteData.classSection.eyebrow}
            </span>
          ) : null}
          <h2 className="mb-4 font-serif text-4xl font-bold text-stone-950 md:text-6xl">
            {siteData.classSection.title}
          </h2>
          <p className="text-lg text-stone-600">{siteData.classSection.description}</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {siteData.classSection.drinks.map((drink: any, index: number) => (
            <article
              key={drink.title}
              className="group relative min-h-72 overflow-hidden rounded-2xl border border-stone-100 shadow-sm transition duration-300 hover:shadow-xl"
            >
              <Image
                src={drink.image}
                alt={drink.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                <h3 className="font-serif text-xl font-bold text-white drop-shadow-md">
                  {index + 1}. {drink.title}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 rounded-3xl bg-coffee-800 p-8 text-white shadow-xl md:grid-cols-3">
          <div className="md:col-span-2">
            <h3 className="mb-2 font-serif text-2xl font-bold text-coffee-200">
              {siteData.classSection.scheduleTitle}
            </h3>
            <p className="mb-4 text-sm text-stone-300">{siteData.classSection.scheduleDescription}</p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
              {siteData.booking.sessions.map((session: string) => (
                <span key={session} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 font-bold">
                  {session}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center md:border-l md:border-t-0 md:pl-8 md:pt-0 md:text-left">
            <p className="mb-1 text-xs uppercase tracking-widest text-stone-400">{siteData.classSection.capacityLabel}</p>
            <p className="font-serif text-3xl font-bold text-white">{siteData.classSection.capacityValue}</p>
            <p className="mt-1 text-xs text-stone-400">{siteData.classSection.capacityDescription}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
