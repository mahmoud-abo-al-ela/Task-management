import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Plus } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import Navbar from "@/components/layout/Navbar";
import TaskList from "@/components/tasks/TaskList";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskBoard from "@/components/tasks/TaskBoard";
import ViewToggle, { type TaskView } from "@/components/tasks/ViewToggle";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import DeleteTaskDialog from "@/components/tasks/DeleteTaskDialog";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [debouncedSearch] = useDebounce(search, 300);

  const [view, setView] = useState<TaskView>("list");

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
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              My Tasks
            </h1>
            <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
              Everything you are working on, in one place.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ViewToggle view={view} onChange={setView} />

            <Button onClick={openCreateForm} aria-label="New task">
              <Plus size={16} />
              <span className="hidden sm:inline">New task</span>
            </Button>
          </div>
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

        {view === "board" && tasks && tasks.length > 0 ? (
          <TaskBoard
            tasks={tasks}
            onEdit={openEditForm}
            onDelete={setTaskToDelete}
          />
        ) : (
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
        )}
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
