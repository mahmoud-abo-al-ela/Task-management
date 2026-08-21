import { format } from "date-fns";
import {
  Calendar,
  Eye,
  MoreVertical,
  Paperclip,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Task } from "@/types";
import { statusOptions, priorityOptions } from "@/lib/taskOptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function TaskCard({
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
  const isDone = task.status === "done";

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2 px-1">
        <div className="min-w-0 flex-1">
          <h3
            className={`capitalize line-clamp-1 wrap-break-word font-medium ml-1 ${
              isDone ? "text-muted-foreground line-through" : ""
            }`}
            title={task.title}
          >
            {task.title}
          </h3>
          <p
            className={`mt-1 line-clamp-1 h-5 text-sm wrap-break-word ml-1 ${
              task.description
                ? "text-muted-foreground"
                : "text-muted-foreground/60 italic"
            }`}
          >
            {task.description || "No description"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {labelFor(statusOptions, task.status)}
            </Badge>
            <Badge className={priorityStyles[task.priority]}>
              {labelFor(priorityOptions, task.priority)}
            </Badge>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} />
                {format(new Date(task.dueDate), "d MMM yyyy")}
              </span>
            )}

            {task.attachment && (
              <span
                className="flex items-center text-muted-foreground"
                title="Has an image"
              >
                <Paperclip size={12} />
                <span className="sr-only">Has an image</span>
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Task actions"
                className="-mt-1 -mr-2 shrink-0"
              >
                <MoreVertical size={16} />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(task)}>
              <Eye size={16} />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil size={16} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 size={16} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
