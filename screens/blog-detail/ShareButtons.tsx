"use client";

import { Copy, Facebook } from "lucide-react";

export function ShareButtons() {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 hidden text-xs font-medium text-stone-400 sm:inline-block">Share:</span>
      <button
        type="button"
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600 transition hover:bg-coffee-700 hover:text-white"
        aria-label="Share on Facebook"
      >
        <Facebook size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(window.location.href);
          window.alert("Link copied to clipboard!");
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-600 transition hover:bg-coffee-700 hover:text-white"
        aria-label="Copy link"
      >
        <Copy size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
