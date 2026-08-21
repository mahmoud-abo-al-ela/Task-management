import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/types";
import TaskCard from "./TaskCard";

export default function DraggableTaskCard({
  task,
  onView,
  onEdit,
  onDelete,
}: {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <TaskCard
        task={task}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
