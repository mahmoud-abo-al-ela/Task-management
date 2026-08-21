import type { Task } from "@/types";
import TaskForm from "./TaskForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TaskFormDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}) {
  const isEditing = Boolean(task);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this task."
              : "Add a task to your list."}
          </DialogDescription>
        </DialogHeader>

        <TaskForm task={task} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
