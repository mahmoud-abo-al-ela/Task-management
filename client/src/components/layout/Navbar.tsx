import { ListChecks, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <ListChecks size={20} />
          <span>Task Manager</span>
        </div>

        <div className="flex items-center gap-3">
          {/* The name is hidden on small screens so the bar does not wrap. */}
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut size={16} />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
