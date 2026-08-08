"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { siteData } from "@/lib/content/site";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/site";

function NavLink({ item, mobile = false }: { item: NavItem; mobile?: boolean }) {
  const isPrimary = item.variant === "primary";

  return (
    <Link
      href={item.href.replace(/\/$/, "") || "/"}
      data-nav-collapsible={!mobile && item.collapseAtTablet ? "true" : undefined}
      className={cn(
        mobile
          ? "block py-3 font-medium text-stone-700 transition hover:text-coffee-600"
          : "font-medium text-stone-600 transition hover:text-coffee-600",
        isPrimary &&
          (mobile
            ? "my-3 rounded-full bg-coffee-600 px-5 py-3 text-center font-semibold text-white hover:bg-coffee-700"
            : "rounded-full bg-coffee-600 px-6 py-2 font-semibold text-white shadow-lg shadow-coffee-600/25 hover:bg-coffee-700")
      )}
    >
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const logo = siteData.brand.logoImage || "/assets/images/logo.png";

  return (
    <header id="site-header">
      <nav className="site-nav fixed z-50 w-full shadow-sm backdrop-blur transition-all duration-300">
        <div className="section-shell">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex flex-shrink-0 items-center gap-2 rounded-md">
              <Image
                src={logo}
                alt=""
                width={40}
                height={40}
                className="brand-logo h-10 w-10"
                aria-hidden="true"
                priority
              />
              <span className="whitespace-nowrap font-serif text-2xl font-bold tracking-tight text-coffee-800 max-sm:text-[1.35rem]">
                {siteData.brand.name}
              </span>
            </Link>

            <div className="desktop-nav hidden items-center gap-8 md:flex">
              {siteData.navigation.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </div>

            <button
              type="button"
              className="inline-flex rounded-md text-2xl text-stone-600 transition hover:text-coffee-600 md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>

          <div
            id="mobile-menu"
            className={cn("mobile-menu border-t border-coffee-700/15 md:hidden", open && "is-open")}
          >
            {siteData.navigation.map((item) => (
              <div key={item.label} onClick={() => setOpen(false)}>
                <NavLink item={item} mobile />
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
