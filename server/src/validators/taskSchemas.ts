import { z } from "zod";

const statuses = ["todo", "in_progress", "done"] as const;
const priorities = ["low", "medium", "high"] as const;

const taskFields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long"),
  status: z.enum(statuses),
  priority: z.enum(priorities),
  dueDate: z.union([z.iso.date(), z.iso.datetime(), z.literal(""), z.null()]),
  removeAttachment: z.literal("true").optional(),
};

export const createTaskSchema = z.object({
  title: taskFields.title,
  description: taskFields.description.optional(),
  status: taskFields.status.optional(),
  priority: taskFields.priority.optional(),
  dueDate: taskFields.dueDate.optional(),
  removeAttachment: taskFields.removeAttachment,
});

export const updateTaskSchema = z.object({
  title: taskFields.title.optional(),
  description: taskFields.description.optional(),
  status: taskFields.status.optional(),
  priority: taskFields.priority.optional(),
  dueDate: taskFields.dueDate.optional(),
  removeAttachment: taskFields.removeAttachment,
});
