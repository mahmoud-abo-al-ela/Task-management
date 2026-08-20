import { useState } from "react";
import { useDebounce } from "use-debounce";
import { ListChecks, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import DeleteTaskDialog from "@/components/tasks/DeleteTaskDialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // Only the debounced value reaches the query, so typing does not send a
  // request per keystroke.
  const [debouncedSearch] = useDebounce(search, 300);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const {
    data: tasks,
    isLoading,
    isError,
    refetch,
  } = useTasks({ search: debouncedSearch, status, priority });

  const hasFilters = Boolean(search || status || priority);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
  }

  function openCreateForm() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <ListChecks size={20} />
            <span>Task Manager</span>
          </div>

          <div className="flex items-center gap-3">
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

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you are working on, in one place.
            </p>
          </div>

          <Button onClick={openCreateForm}>
            <Plus size={16} />
            <span className="hidden sm:inline">New task</span>
          </Button>
        </div>

        <TaskFilters
          search={search}
          status={status}
          priority={priority}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          onEdit={openEditForm}
          onDelete={setTaskToDelete}
        />
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
      />

      <DeleteTaskDialog
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
}
