import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="font-semibold">My Tasks</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-fg-muted">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface-muted"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <p className="text-fg-muted">Tasks go here next.</p>
      </main>
    </div>
  );
}
