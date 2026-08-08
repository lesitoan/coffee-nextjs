"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { siteData } from "@/lib/content/site";

type BookingHistory = {
  packageName?: string;
  fullName?: string;
  contact?: string;
  date?: string;
  session?: string;
  guests?: string;
  createdAt?: string;
  note?: string;
};

function readBookingHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(siteData.booking.historyStorageKey) || "[]");
    return Array.isArray(parsed) ? (parsed as BookingHistory[]) : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function HistoriesScreen() {
  const [histories, setHistories] = useState<BookingHistory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistories(readBookingHistory());
    setLoaded(true);
  }, []);

  return (
    <section id="histories-page" className="soft-bg min-h-screen pb-20 pt-32">
      <div className="section-shell">
        <div className="mb-10 max-w-3xl">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">Histories</span>
          <h1 className="mb-4 font-serif text-3xl font-bold text-stone-800 md:text-5xl">Booking histories</h1>
          <p className="text-lg leading-relaxed text-stone-600">
            Your successful booking requests are stored locally in this browser.
          </p>
        </div>

        <div className="space-y-4">
          {loaded && histories.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-8">
              <h2 className="mb-3 font-serif text-2xl font-bold text-stone-800">No booking history yet</h2>
              <p className="mb-6 text-stone-600">After a successful booking, the request will appear here.</p>
              <Link href="/book" className="inline-flex rounded-full bg-coffee-700 px-6 py-3 font-semibold text-white transition hover:bg-coffee-800">
                Create a booking
              </Link>
            </div>
          ) : null}

          {histories.map((booking, index) => (
            <details key={`${booking.createdAt}-${index}`} className="history-item overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between md:p-6">
                <span>
                  <span className="block text-sm font-bold uppercase tracking-wider text-coffee-600">
                    Booking {histories.length - index}
                  </span>
                  <span className="block font-serif text-xl font-bold text-stone-800">
                    {booking.packageName || "Coffee Experience"}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-sm text-stone-600">
                  <span>{formatDate(booking.date)}</span>
                  <ChevronDown className="history-chevron text-coffee-600" size={18} aria-hidden="true" />
                </span>
              </summary>
              <div className="border-t border-stone-100 px-5 pb-6 md:px-6">
                <dl className="grid grid-cols-1 gap-4 pt-5 text-sm md:grid-cols-2">
                  {[
                    ["Full name", booking.fullName],
                    ["Contact", booking.contact],
                    ["Package", booking.packageName],
                    ["Date", formatDate(booking.date)],
                    ["Session", booking.session],
                    ["Guests", booking.guests],
                    ["Submitted at", formatDateTime(booking.createdAt)],
                    ["Note", booking.note || "No note"]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-stone-100 bg-stone-50 p-4">
                      <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-stone-500">{label}</dt>
                      <dd className="text-stone-800">{value || "-"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
