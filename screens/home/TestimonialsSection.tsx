"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { siteData, testimonialsData } from "@/lib/content/site";

export function TestimonialsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const track = trackRef.current;
    if (!slider || !track) return;

    const originalCards = Array.from(track.querySelectorAll<HTMLElement>(".testimonial-card:not([data-slider-clone])"));
    if (!originalCards.length) return;

    track.querySelectorAll("[data-slider-clone]").forEach((node) => node.remove());
    const cloneCount = Math.min(3, originalCards.length);
    originalCards
      .slice(-cloneCount)
      .reverse()
      .forEach((card) => {
        const clone = card.cloneNode(true) as HTMLElement;
        clone.dataset.sliderClone = "true";
        clone.setAttribute("aria-hidden", "true");
        track.insertBefore(clone, track.firstChild);
      });
    originalCards.slice(0, cloneCount).forEach((card) => {
      const clone = card.cloneNode(true) as HTMLElement;
      clone.dataset.sliderClone = "true";
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    let index = cloneCount;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let autoplayTimer: ReturnType<typeof setInterval> | null = null;
    let isDragging = false;
    let dragStart = 0;
    let dragDelta = 0;
    let dragStartOffset = 0;

    const visibleCount = () => (window.matchMedia("(max-width: 640px)").matches ? 2 : 3);
    const isMobile = () => window.matchMedia("(max-width: 640px)").matches;
    const shouldSlide = () => originalCards.length > visibleCount();
    const axisValue = (event: PointerEvent) => (isMobile() ? event.clientY : event.clientX);
    const getStep = () => {
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      const rect = originalCards[0].getBoundingClientRect();
      return (isMobile() ? rect.height : rect.width) + gap;
    };
    const setOffset = (offset: number, animate = true) => {
      track.style.transition = animate ? "" : "none";
      track.style.transform = isMobile() ? `translateY(${offset}px)` : `translateX(${offset}px)`;
      if (!animate) {
        track.offsetHeight;
        track.style.transition = "";
      }
    };
    const currentOffset = () => -index * getStep();
    const moveTo = (nextIndex: number, animate = true) => {
      index = nextIndex;
      setOffset(currentOffset(), animate);
    };
    const normalizeIndex = () => {
      if (index >= originalCards.length + cloneCount) moveTo(cloneCount, false);
      else if (index < cloneCount) moveTo(originalCards.length + cloneCount - 1, false);
    };
    const scheduleNormalize = () => {
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(normalizeIndex, 560);
    };
    const update = () => {
      if (!shouldSlide()) {
        moveTo(0, false);
        return;
      }
      const logicalIndex = (((index - cloneCount) % originalCards.length) + originalCards.length) % originalCards.length;
      moveTo(cloneCount + logicalIndex, false);
    };
    const startAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => {
        if (!shouldSlide() || isDragging) return;
        moveTo(index + 1, true);
        scheduleNormalize();
      }, 2000);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!shouldSlide()) return;
      isDragging = true;
      dragStart = axisValue(event);
      dragDelta = 0;
      dragStartOffset = currentOffset();
      slider.classList.add("is-dragging");
      slider.setPointerCapture(event.pointerId);
      if (autoplayTimer) clearInterval(autoplayTimer);
      if (resetTimer) clearTimeout(resetTimer);
      track.style.transition = "none";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      dragDelta = axisValue(event) - dragStart;
      setOffset(dragStartOffset + dragDelta, false);
      event.preventDefault();
    };
    const finishDrag = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      slider.classList.remove("is-dragging");
      if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);

      const threshold = getStep() * 0.18;
      if (dragDelta < -threshold) moveTo(index + 1, true);
      else if (dragDelta > threshold) moveTo(index - 1, true);
      else moveTo(index, true);
      scheduleNormalize();
      startAutoplay();
    };

    update();
    startAutoplay();
    window.addEventListener("resize", update);
    slider.addEventListener("pointerdown", onPointerDown);
    slider.addEventListener("pointermove", onPointerMove);
    slider.addEventListener("pointerup", finishDrag);
    slider.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("resize", update);
      slider.removeEventListener("pointerdown", onPointerDown);
      slider.removeEventListener("pointermove", onPointerMove);
      slider.removeEventListener("pointerup", finishDrag);
      slider.removeEventListener("pointercancel", finishDrag);
      if (autoplayTimer) clearInterval(autoplayTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="section-bg relative overflow-hidden bg-coffee-900 py-20 text-white"
      style={{ "--section-bg-image": `url("${siteData.testimonials.backgroundImage}")` } as CSSProperties}
    >
      <div className="absolute inset-0 bg-coffee-900/80" aria-hidden="true" />
      <div className="section-shell relative z-10">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold md:text-5xl">{siteData.testimonials.title}</h2>
          <p className="text-coffee-200">{siteData.testimonials.description}</p>
        </div>
        <div ref={sliderRef} className="testimonial-slider" aria-label="Guest testimonials">
          <div ref={trackRef} className="testimonial-track">
            {testimonialsData.map((item, index) => (
              <article key={`${item.author}-${index}`} className="testimonial-card rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur">
                <div className="mb-4 flex gap-1 text-sm text-amber-400" aria-label="5 star rating">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} size={16} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p className="mb-6 italic leading-relaxed text-stone-200">"{item.quote}"</p>
                <h3 className="font-bold">
                  - {item.author} ({item.location})
                </h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
