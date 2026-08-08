import Image from "next/image";
import Link from "next/link";
import { siteData } from "@/lib/content/site";

export function BookingPreviewSection() {
  return (
    <section id="booking" className="soft-bg py-24">
      <div className="section-shell">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">Booking</span>
          <h2 className="mb-4 font-serif text-3xl font-bold text-stone-800 md:text-5xl">{siteData.booking.title}</h2>
          <p className="text-lg text-stone-600">{siteData.booking.description}</p>
        </div>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
          {siteData.booking.packages.map((item: any) => (
            <article key={item.id} className="booking-package flex flex-col rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition duration-300">
              <Image src={item.image} alt={item.name} width={700} height={430} className="mb-6 h-48 w-full rounded-2xl object-cover" />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-coffee-600">{item.badge}</p>
                  <h3 className="font-serif text-2xl font-bold text-stone-800">{item.name}</h3>
                </div>
                <Image src={siteData.brand.logoImage || "/assets/images/logo.png"} alt="" width={48} height={48} className="brand-logo h-12 w-12" />
              </div>
              <p className="mb-6 leading-relaxed text-stone-600">{item.description}</p>
              <p className="mb-6 text-3xl font-bold text-coffee-700">
                {item.price} <span className="text-base font-medium text-stone-500">{item.unit}</span>
              </p>
              <div className="flex-1" />
              <Link
                className="rounded-xl bg-coffee-700 py-3 text-center font-bold text-white shadow-lg shadow-coffee-800/20 transition hover:bg-coffee-800"
                href={`/book?type=${encodeURIComponent(item.id)}`}
              >
                Book Now (Discount 10%)
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
