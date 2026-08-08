import Link from "next/link";
import type { CSSProperties } from "react";
import { siteData } from "@/lib/content/site";

export function HeroSection() {
  const titleLines = siteData.hero.titleLines?.length ? siteData.hero.titleLines : [siteData.hero.title];

  return (
    <section
      id="hero"
      className="hero-bg relative flex min-h-[90vh] items-center overflow-hidden pb-20 pt-32 md:pb-32 md:pt-48"
      style={{ "--hero-image": `url("${siteData.hero.backgroundImage}")` } as CSSProperties}
    >
      <div className="section-shell relative z-10 text-center">
        <span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-coffee-200 md:text-base">
          {siteData.hero.eyebrow}
        </span>
        <h1 className="mx-auto mb-6 max-w-5xl overflow-wrap-anywhere font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mx-auto mb-10 mt-4 max-w-xs text-base font-light text-stone-200 sm:max-w-2xl md:text-xl">
          {siteData.hero.description}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={siteData.hero.primaryCta.href}
            className="rounded-full bg-coffee-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-coffee-600/40 transition hover:bg-coffee-500"
          >
            {siteData.hero.primaryCta.label}
          </Link>
          <Link
            href={siteData.hero.secondaryCta.href}
            className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {siteData.hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
