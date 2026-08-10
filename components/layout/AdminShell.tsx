import Link from "next/link";
import type { AdminSession } from "@/lib/auth/session";

type AdminShellProps = {
  admin: AdminSession;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Posts", href: "/admin/posts" },
  { label: "Categories", href: "/admin/categories" }
];

export function AdminShell({ admin, children }: AdminShellProps) {
  return (
    <section className="h-screen overflow-hidden bg-stone-100">
      <div className="flex h-full w-full flex-col">
        <div className="flex h-14 flex-none items-center justify-between border-b border-stone-200 bg-white px-5">
          <div className="flex min-w-0 items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">Admin</p>
            <h1 className="truncate font-serif text-lg font-bold text-stone-900">Classic Coffee Content</h1>
            <p className="hidden text-sm text-stone-500 sm:block">Signed in as {admin.login}</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-sm border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-coffee-700 hover:text-coffee-700">
              Sign out
            </button>
          </form>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr]">
          <aside className="h-full overflow-y-auto border-r border-stone-200 bg-white">
            <nav>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="block border-b border-stone-100 px-5 py-4 text-sm font-semibold text-stone-700 transition hover:bg-coffee-50 hover:text-coffee-700">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-h-0 overflow-y-auto">{children}</div>
        </div>
      </div>
    </section>
  );
}
