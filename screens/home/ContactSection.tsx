"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";
import { siteData } from "@/lib/content/site";
import { formatVietnamDateTime } from "@/lib/utils";

type Errors = Partial<Record<"name" | "phone" | "message", string>>;

function normalizeVietnamPhone(phone: string) {
  const compact = phone.replace(/\s+/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("84")) return `+${compact}`;
  if (compact.startsWith("0")) return `+84${compact.slice(1)}`;
  return `+84${compact}`;
}

function toSingleLine(value: string) {
  return value.trim().replace(/\s*\r?\n\s*/g, " ").replace(/\s{2,}/g, " ");
}

async function sendNoCors(endpoint: string, payload: Record<string, unknown>) {
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

export function ContactSection() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = toSingleLine(String(formData.get("message") || ""));
    const nextErrors: Errors = {};
    const digits = phone.replace(/\D/g, "");

    if (!name) nextErrors.name = "Please enter your full name.";
    else if (name.length < 2) nextErrors.name = "Full name must have at least 2 characters.";
    if (!phone) nextErrors.phone = "Please enter your phone number.";
    else if (digits.length < 8 || digits.length > 15) nextErrors.phone = "Please enter a valid phone number.";
    if (!message) nextErrors.message = "Please enter your message.";
    else if (message.length < 5) nextErrors.message = "Message must have at least 5 characters.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const endpoint = String(siteData.booking.googleSheetsEndpoint || "").trim();
    if (!endpoint) {
      setStatus("Google Sheets endpoint is not configured yet.");
      setStatusType("error");
      return;
    }

    const payload = {
      createdAt: formatVietnamDateTime(),
      source: "contact",
      type: "contact",
      formType: "contact",
      targetSheet: "Contacts",
      packageId: "contact",
      packageName: "Contact Message",
      fullName: name,
      contact: normalizeVietnamPhone(phone),
      date: "",
      session: "",
      guests: "",
      note: message,
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
      if (!response.ok || result.ok === false) throw new Error(result.message || "Could not send your message.");
      setStatus("Your message has been saved. Thank you.");
      setStatusType("success");
      form.reset();
    } catch (error) {
      const sentWithFallback = await sendNoCors(endpoint, payload);
      if (sentWithFallback) {
        setStatus("Your message has been sent. Please check the Google Sheet.");
        setStatusType("success");
        form.reset();
      } else {
        setStatus(error instanceof Error ? error.message : "Could not send your message.");
        setStatusType("error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      className="section-bg relative overflow-hidden bg-coffee-900 py-20 text-white"
      style={{ "--section-bg-image": `url("${siteData.contactSection.backgroundImage}")` } as CSSProperties}
    >
      <div className="section-bg-blur absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-coffee-900/72" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-2">
          <div className="flex h-full flex-col justify-center">
            <div className="mb-6 flex items-center gap-3">
              <Image src={siteData.brand.logoImage || "/assets/images/logo.png"} alt="" width={40} height={40} className="brand-logo h-10 w-10" />
              <span className="text-xl font-bold">{siteData.contactSection.eyebrow}</span>
            </div>
            <h2 className="mb-8 font-serif text-4xl font-bold leading-tight md:text-5xl">{siteData.contactSection.title}</h2>
            <p className="max-w-3xl text-lg leading-relaxed text-coffee-100 md:text-xl">{siteData.contactSection.description}</p>
          </div>

          <div className="flex h-full flex-col rounded-3xl border border-white/20 bg-white/10 p-6 md:p-10">
            <h3 className="mb-5 text-3xl font-bold">{siteData.contactSection.formTitle}</h3>
            <p className="mb-10 text-lg leading-relaxed text-coffee-100">{siteData.contactSection.formDescription}</p>
            <form onSubmit={onSubmit} className="flex flex-1 flex-col space-y-8">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <label>
                  <span className="mb-3 block text-lg font-bold">Full Name</span>
                  <input name="name" type="text" required className="contact-input" placeholder="Your name" />
                  <span className="field-error mt-2 block text-sm text-red-200">{errors.name}</span>
                </label>
                <label>
                  <span className="mb-3 block text-lg font-bold">Phone Number</span>
                  <div className="flex items-center gap-3 border-b border-white/20">
                    <span className="pb-3 font-bold text-stone-200">+84</span>
                    <input name="phone" type="tel" required className="contact-input border-0" placeholder="Phone Number" />
                  </div>
                  <span className="field-error mt-2 block text-sm text-red-200">{errors.phone}</span>
                </label>
              </div>
              <label className="block">
                <span className="mb-3 block text-lg font-bold">Message</span>
                <textarea name="message" rows={4} required className="contact-input resize-y" placeholder="Write your message" />
                <span className="field-error mt-2 block text-sm text-red-200">{errors.message}</span>
              </label>
              <div className="mt-auto flex justify-end">
                <button disabled={submitting} type="submit" className="rounded-full bg-coffee-200 px-8 py-4 font-bold text-stone-900 shadow-lg shadow-black/20 transition hover:bg-coffee-300 disabled:opacity-60">
                  {submitting ? "Sending..." : siteData.contactSection.submitLabel}
                </button>
              </div>
              <p className={`booking-status text-right text-sm font-semibold ${statusType === "success" ? "text-green-200" : ""} ${statusType === "error" ? "text-red-200" : ""}`} role="status">
                {status}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
