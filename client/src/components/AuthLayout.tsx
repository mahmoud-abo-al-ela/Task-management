import { CheckCircle2, ListChecks } from "lucide-react";

const highlights = [
  "Keep every task in one place",
  "Filter by status and priority",
  "Find anything by title in seconds",
];

// Shared frame for the login and register pages: a brand panel on large
// screens, and just the form on mobile.
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Hidden on small screens so the form stays above the fold on mobile. */}
      <aside className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col">
        <div className="flex items-center gap-2 font-semibold">
          <ListChecks size={22} />
          <span>Task Manager</span>
        </div>

        <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
          <h2 className="text-3xl font-semibold leading-tight">
            Plan your day,
            <br />
            finish what matters.
          </h2>

          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 opacity-90">
                <CheckCircle2 size={18} />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 font-semibold lg:hidden">
            <ListChecks size={20} />
            <span>Task Manager</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
