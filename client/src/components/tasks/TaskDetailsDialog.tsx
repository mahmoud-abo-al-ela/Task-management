import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";
import { statusOptions, priorityOptions } from "@/lib/taskOptions";
import TaskAttachment from "./TaskAttachment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function TaskDetailsDialog({
  task,
  onClose,
  onEdit,
  onDelete,
}: {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <Dialog open={Boolean(task)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {task && (
          <>
            <DialogHeader>
              <DialogTitle className="wrap-break-word">
                {task.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {labelFor(statusOptions, task.status)}
                </Badge>
                <Badge variant="outline">
                  {labelFor(priorityOptions, task.priority)} priority
                </Badge>
              </div>

              <p className="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                {task.description || "No description."}
              </p>

              <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className="mt-0.5">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "d MMM yyyy")
                      : "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="mt-0.5">
                    {format(new Date(task.createdAt), "d MMM yyyy")}
                  </dd>
                </div>
              </dl>
              <TaskAttachment task={task} />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
              >
                <Trash2 size={16} />
                Delete
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
              >
                <Pencil size={16} />
                Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
