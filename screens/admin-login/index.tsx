type AdminLoginScreenProps = {
  error?: string;
};

export function AdminLoginScreen({ error }: AdminLoginScreenProps) {
  return (
    <section className="min-h-screen bg-stone-100 pb-20 pt-32">
      <div className="section-shell">
        <div className="mx-auto max-w-md rounded-sm border border-stone-200 bg-white p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-coffee-600">Admin Login</p>
          <h1 className="mb-4 font-serif text-3xl font-bold text-stone-900">Sign in with GitHub</h1>
          <p className="mb-6 text-sm leading-relaxed text-stone-600">
            Use the GitHub account allowed for this project to manage posts and categories.
          </p>
          {error ? (
            <div className="mb-5 rounded-sm border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}
          <a href="/api/auth/signin?callbackUrl=/admin" className="inline-flex w-full justify-center rounded-sm bg-stone-900 px-5 py-3 font-bold text-white transition hover:bg-coffee-800">
            Continue with GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
