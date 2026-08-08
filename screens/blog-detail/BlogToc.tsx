"use client";

import { ListOrdered } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content/html";
import { cn } from "@/lib/utils";

export function BlogToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id || "");

  useEffect(() => {
    if (!headings.length) return;
    const update = () => {
      const scrollPos = window.scrollY + 140;
      let nextId = headings[0].id;
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element && element.offsetTop <= scrollPos) nextId = heading.id;
      });
      setActiveId(nextId);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  if (!headings.length) return null;

  return (
    <div className="rounded-lg border border-stone-200/80 bg-white p-5 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="mb-3 flex items-center justify-between border-b border-stone-200 pb-3">
        <h3 className="flex items-center gap-2 font-serif text-base font-bold text-stone-800 sm:text-lg">
          <ListOrdered size={18} className="text-coffee-700" aria-hidden="true" />
          <span>Table of Contents</span>
        </h3>
      </div>
      <nav className="space-y-1 text-xs sm:text-sm">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block rounded border-l-2 px-2 py-1 font-medium transition hover:border-coffee-600 hover:text-coffee-700",
              heading.level === 3 && "ml-3 text-xs",
              activeId === heading.id
                ? "border-coffee-700 bg-coffee-50/50 font-bold text-coffee-700"
                : "border-transparent text-stone-600"
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
