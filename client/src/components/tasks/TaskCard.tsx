import { format } from "date-fns";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const statusLabels: Record<Task["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const priorityLabels: Record<Task["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const isDone = task.status === "done";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-2">
          <h3
            className={`wrap-break-word font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="line-clamp-2 text-sm wrap-break-word text-muted-foreground">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{statusLabels[task.status]}</Badge>
            <Badge className={priorityStyles[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} />
                {format(new Date(task.dueDate), "d MMM yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit task"
            onClick={() => onEdit(task)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete task"
            onClick={() => onDelete(task)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
