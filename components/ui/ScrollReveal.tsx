"use client";

import { useEffect } from "react";

const revealGroups: Array<[string, string]> = [
  ["#hero .section-shell", "fade-up"],
  ["#about .grid > :first-child", "fade-right"],
  ["#about .grid > :last-child", "fade-left"],
  ["#class .text-center", "fade-up"],
  ["#class article", "flip-up"],
  ["#class .bg-coffee-800", "fade-up"],
  ["#why-us .grid > :first-child", "zoom-in"],
  ["#why-us .grid > :last-child", "fade-left"],
  ["#testimonials .text-center", "fade-up"],
  ["#testimonials .testimonial-slider", "zoom-in-up"],
  ["#booking .text-center", "fade-up"],
  ["#booking .booking-package", "fade-up"],
  ["#contact .grid > :first-child", "fade-right"],
  ["#contact .grid > :last-child", "fade-left"],
  ["#location .grid > :first-child", "fade-right"],
  ["#location .grid > :last-child", "fade-left"],
  ["#book-page .section-shell > .max-w-3xl", "fade-up"],
  ["#book-page .compact-package", "zoom-in"],
  ["#booking-form-card", "fade-up"],
  ["#histories-page .section-shell > .max-w-3xl", "fade-up"],
  ["#histories-page .history-item", "fade-up"],
  ["#blogs-page .section-shell > *", "fade-up"],
  ["#blog-detail-page article", "fade-up"],
  ["#blog-detail-page aside", "fade-left"]
];

export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const elements: Element[] = [];

    revealGroups.forEach(([selector, animation]) => {
      document.querySelectorAll<HTMLElement>(selector).forEach((element, index) => {
        element.dataset.reveal = animation;
        element.style.setProperty("--reveal-delay", `${Math.min(index * 90, 270)}ms`);
        elements.push(element);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.08
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        element.classList.remove("is-revealed");
        delete (element as HTMLElement).dataset.reveal;
        (element as HTMLElement).style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
