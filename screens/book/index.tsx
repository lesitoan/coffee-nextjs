"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteData } from "@/lib/content/site";
import { cn, formatVietnamDateTime } from "@/lib/utils";

type Errors = Partial<Record<"fullName" | "contact" | "date" | "session" | "guests", string>>;

function readBookingHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(siteData.booking.historyStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function sendWithNoCors(endpoint: string, payload: Record<string, unknown>) {
  try {
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return true;
  } catch {
    return false;
  }
}

export function BookScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedType = searchParams.get("type");
  const initialPackage = siteData.booking.packages.find((item: any) => item.id === requestedType) || siteData.booking.packages[0];
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage.id);
  const [guests, setGuests] = useState(String(initialPackage.defaultGuests || ""));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [submitting, setSubmitting] = useState(false);

  const selectedPackage = siteData.booking.packages.find((item: any) => item.id === selectedPackageId) || siteData.booking.packages[0];

  useEffect(() => {
    const nextPackage = siteData.booking.packages.find((item: any) => item.id === requestedType) || siteData.booking.packages[0];
    setSelectedPackageId(nextPackage.id);
    setGuests(String(nextPackage.defaultGuests || ""));
  }, [requestedType]);

  function selectPackage(packageId: string) {
    const nextPackage = siteData.booking.packages.find((item: any) => item.id === packageId) || siteData.booking.packages[0];
    setSelectedPackageId(nextPackage.id);
    setGuests(String(nextPackage.defaultGuests || ""));
    setStatus("");
    setStatusType("");
    router.replace(`/book?type=${encodeURIComponent(nextPackage.id)}`, { scroll: false });
  }

  function validate(formData: FormData) {
    const nextErrors: Errors = {};
    const fullName = String(formData.get("fullName") || "").trim();
    const contact = String(formData.get("contact") || "").trim();
    const date = String(formData.get("date") || "");
    const session = String(formData.get("session") || "");
    const guestsValue = Number(formData.get("guests") || "");
    const maxGuests = Math.max(...siteData.booking.guestOptions);

    if (!fullName) nextErrors.fullName = "Please enter your full name.";
    else if (fullName.length < 2) nextErrors.fullName = "Full name must have at least 2 characters.";
    if (!contact) nextErrors.contact = "Please enter your contact.";
    else if (contact.length < 5) nextErrors.contact = "Please enter a valid email, WhatsApp, Zalo, or phone number.";
    if (!date) nextErrors.date = "Please choose a date.";
    else {
      const selectedDate = new Date(`${date}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) nextErrors.date = "Please choose today or a future date.";
    }
    if (!session) nextErrors.session = "Please select a session.";
    if (!formData.get("guests")) nextErrors.guests = "Please select number of guests.";
    else if (!Number.isInteger(guestsValue) || guestsValue < 1 || guestsValue > maxGuests) {
      nextErrors.guests = `Guests must be between 1 and ${maxGuests}.`;
    }

    return nextErrors;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const endpoint = String(siteData.booking.googleSheetsEndpoint || "").trim();
    if (!endpoint) {
      setStatus(siteData.booking.submitLabels.missingEndpoint);
      setStatusType("error");
      return;
    }

    const payload = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      createdAt: formatVietnamDateTime(),
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      fullName: String(formData.get("fullName") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      date: String(formData.get("date") || ""),
      session: String(formData.get("session") || ""),
      guests: String(formData.get("guests") || ""),
      note: String(formData.get("note") || "").trim(),
      pageUrl: window.location.href
    };

    setSubmitting(true);
    setStatus("");
    setStatusType("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "follow"
      });
      let result: { ok?: boolean; message?: string } = { ok: response.ok };
      try {
        result = await response.json();
      } catch {}
      if (!response.ok || result.ok === false) throw new Error(result.message || siteData.booking.submitLabels.error);
      completeSuccessfulBooking(payload);
    } catch (error) {
      const sentWithFallback = await sendWithNoCors(endpoint, payload);
      if (sentWithFallback) {
        completeSuccessfulBooking(payload);
      } else {
        setStatus(error instanceof Error ? error.message : siteData.booking.submitLabels.error);
        setStatusType("error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function completeSuccessfulBooking(payload: Record<string, unknown>) {
    const current = readBookingHistory();
    current.unshift(payload);
    localStorage.setItem(siteData.booking.historyStorageKey, JSON.stringify(current));
    setStatus(siteData.booking.submitLabels.success);
    setStatusType("success");
    window.location.href = "/histories";
  }

  return (
    <section id="book-page" className="soft-bg min-h-screen pb-20 pt-32">
      <div className="section-shell">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-2 block text-sm font-semibold uppercase tracking-wider text-coffee-600">Booking</span>
          <h1 className="mb-4 font-serif text-3xl font-bold text-stone-800 md:text-5xl">{siteData.booking.formTitle}</h1>
          <p className="text-lg leading-relaxed text-stone-600">{siteData.booking.formDescription}</p>
        </div>

        <div className="mx-auto max-w-4xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-10" id="booking-form-card">
          <div className="mb-8">
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-coffee-600">Booking Form</p>
            <h2 className="font-serif text-2xl font-bold text-stone-800 md:text-3xl">Your details</h2>
          </div>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
            <div className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Selected package</span>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {siteData.booking.packages.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn("compact-package rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-coffee-600 hover:bg-white", selectedPackageId === item.id && "is-selected")}
                    aria-pressed={selectedPackageId === item.id}
                    onClick={() => selectPackage(item.id)}
                  >
                    <span className="block font-serif font-bold text-stone-800">{item.name}</span>
                    <span className="mt-1 block text-sm font-bold text-coffee-700">
                      {item.price} <span className="font-medium text-stone-500">{item.unit}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span className="mb-2 block text-sm font-semibold text-stone-700">Full name</span>
              <input name="fullName" type="text" required placeholder="Your full name" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 transition focus:outline-none focus:ring-2 focus:ring-coffee-500" />
              <span className="field-error mt-2 block text-sm text-red-700">{errors.fullName}</span>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-stone-700">WhatsApp / Zalo / Phone</span>
              <input name="contact" type="text" required placeholder="Please provide your contact details" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 transition focus:outline-none focus:ring-2 focus:ring-coffee-500" />
              <span className="field-error mt-2 block text-sm text-red-700">{errors.contact}</span>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-stone-700">Date</span>
              <input name="date" type="date" required className="w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-stone-600 transition focus:outline-none focus:ring-2 focus:ring-coffee-500" />
              <span className="field-error mt-2 block text-sm text-red-700">{errors.date}</span>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-stone-700">Session</span>
              <select name="session" required className="booking-select w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-stone-600 transition focus:outline-none focus:ring-2 focus:ring-coffee-500">
                <option value="">Select Session</option>
                {siteData.booking.sessions.map((session: string) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
              <span className="field-error mt-2 block text-sm text-red-700">{errors.session}</span>
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-stone-700">Guests</span>
              <select name="guests" value={guests} onChange={(event) => setGuests(event.target.value)} required className="booking-select w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-stone-600 transition focus:outline-none focus:ring-2 focus:ring-coffee-500">
                <option value="">Number of Guests</option>
                {siteData.booking.guestOptions.map((guest: number) => (
                  <option key={guest} value={guest}>
                    {guest} {guest === 1 ? "Person" : "People"}
                  </option>
                ))}
              </select>
              <span className="field-error mt-2 block text-sm text-red-700">{errors.guests}</span>
            </label>
            <label className="md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Note</span>
              <textarea name="note" rows={4} placeholder="Tell us anything we should prepare for." className="w-full resize-y rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 transition focus:outline-none focus:ring-2 focus:ring-coffee-500" />
            </label>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting} className="mt-2 w-full rounded-xl bg-coffee-800 py-4 font-bold text-white shadow-lg transition hover:bg-coffee-900 disabled:bg-stone-400">
                {submitting ? siteData.booking.submitLabels.submitting : siteData.booking.submitLabels.idle}
              </button>
              <p className={`booking-status mt-4 text-sm font-semibold ${statusType === "success" ? "text-green-700" : ""} ${statusType === "error" ? "text-red-700" : ""}`} role="status">
                {status}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
