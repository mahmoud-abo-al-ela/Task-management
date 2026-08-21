import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  taskSchema,
  type TaskForm as TaskFormValues,
} from "@/schemas/taskSchemas";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { statusOptions, priorityOptions } from "@/lib/taskOptions";
import type { Task } from "@/types";
import FormField from "@/components/FormField";
import SelectField from "./SelectField";
import DateField from "./DateField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";

const emptyTask: TaskFormValues = {
  title: "",
  description: "",
  status: "todo",
  priority: "low",
  dueDate: "",
};

function toFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  };
}

export default function TaskForm({
  task,
  onDone,
}: {
  task: Task | null;
  onDone: () => void;
}) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? toFormValues(task) : emptyTask,
  });

  useEffect(() => {
    reset(task ? toFormValues(task) : emptyTask);
  }, [task, reset]);

  async function onSubmit(values: TaskFormValues) {
    const data = { ...values, dueDate: values.dueDate || null };

    if (task) {
      await updateTask.mutateAsync({ id: task._id, data });
    } else {
      await createTask.mutateAsync(data);
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField id="title" label="Title" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="What needs doing?"
          aria-invalid={!!errors.title}
          {...register("title")}
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={3}
          placeholder="Any extra detail (optional)"
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={statusOptions}
        />
        <SelectField
          control={control}
          name="priority"
          label="Priority"
          options={priorityOptions}
        />
      </div>

      <DateField control={control} />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {task ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
