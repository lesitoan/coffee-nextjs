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
    <section className="min-h-screen bg-stone-100 pb-12 pt-28">
      <div className="section-shell">
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-sm border border-stone-200 bg-white p-5 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-coffee-600">Admin</p>
            <h1 className="font-serif text-2xl font-bold text-stone-900">Classic Coffee Content</h1>
            <p className="text-sm text-stone-500">Signed in as {admin.login}</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="rounded-sm border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:border-coffee-700 hover:text-coffee-700">
              Sign out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-sm border border-stone-200 bg-white p-3 shadow-sm">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-sm px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-coffee-50 hover:text-coffee-700">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
