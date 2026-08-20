import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMoveTask } from "@/hooks/useTasks";
import { statusOptions } from "@/lib/taskOptions";
import type { Task, TaskStatus } from "@/types";
import BoardColumn from "./BoardColumn";
import TaskCard from "./TaskCard";

export default function TaskBoard({
  tasks,
  onEdit,
  onDelete,
}: {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const moveTask = useMoveTask();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setDraggedTask(tasks.find((task) => task._id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggedTask(null);

    const taskId = String(event.active.id);
    const newStatus = event.over?.id as TaskStatus | undefined;
    if (!newStatus) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;

    moveTask.mutate({ id: taskId, status: newStatus });
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {statusOptions.map((column) => (
          <BoardColumn
            key={column.value}
            id={column.value as TaskStatus}
            label={column.label}
            tasks={tasks.filter((task) => task.status === column.value)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {draggedTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard task={draggedTask} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
