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
import TaskDetailsDialog from "@/components/tasks/TaskDetailsDialog";
import TaskPagination from "@/components/tasks/TaskPagination";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const [debouncedSearch] = useDebounce(search, 300);

  const [view, setView] = useState<TaskView>("list");

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);

  const isBoard = view === "board";

  const { data, isLoading, isError, refetch } = useTasks({
    search: debouncedSearch,
    status,
    priority,
    page: isBoard ? 1 : page,
    limit: isBoard ? 50 : 10,
  });

  const hasFilters = Boolean(search || status || priority);

  function changeFilter(setValue: (value: string) => void) {
    return (value: string) => {
      setValue(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPriority("");
    setPage(1);
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
    // In board view the page itself must not scroll — the columns do. So the
    // shell is locked to the viewport height and the board takes what is left.
    <div className={`flex flex-col ${isBoard ? "h-dvh" : "min-h-dvh"}`}>
      <Navbar />

      <main className="mx-auto flex w-full min-h-0 max-w-5xl flex-1 flex-col px-4 py-6">
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
          onSearchChange={changeFilter(setSearch)}
          onStatusChange={changeFilter(setStatus)}
          onPriorityChange={changeFilter(setPriority)}
          onClear={clearFilters}
          hasFilters={hasFilters}
        />

        {isBoard && data && data.tasks.length > 0 ? (
          <TaskBoard
            tasks={data.tasks}
            onView={setTaskToView}
            onEdit={openEditForm}
            onDelete={setTaskToDelete}
          />
        ) : (
          <>
            <TaskList
              tasks={data?.tasks}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              hasFilters={hasFilters}
              onClearFilters={clearFilters}
              onView={setTaskToView}
            onEdit={openEditForm}
              onDelete={setTaskToDelete}
            />

            {/* List view only: the board shows every column at once. */}
            {data && (
              <TaskPagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
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

      <TaskDetailsDialog
        task={taskToView}
        onClose={() => setTaskToView(null)}
        onEdit={openEditForm}
        onDelete={setTaskToDelete}
      />
    </div>
  );
}
