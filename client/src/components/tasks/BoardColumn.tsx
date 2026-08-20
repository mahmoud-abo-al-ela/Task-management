import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types";
import DraggableTaskCard from "./DraggableTaskCard";

export default function BoardColumn({
  id,
  label,
  tasks,
  onEdit,
  onDelete,
}: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border p-3 transition-colors ${
        isOver ? "border-primary bg-accent" : "bg-muted/40"
      }`}
    >
      <h2 className="mb-3 flex items-center justify-between text-sm font-medium">
        {label}
        <span className="text-muted-foreground">{tasks.length}</span>
      </h2>

      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nothing here
          </p>
        )}
      </div>
    </section>
  );
}
