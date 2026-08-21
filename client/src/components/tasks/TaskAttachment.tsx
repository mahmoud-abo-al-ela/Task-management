import type { Task } from "@/types";
import { useAttachment } from "@/hooks/useAttachment";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskAttachment({ task }: { task: Task }) {
  const hasAttachment = Boolean(task.attachment);
  const { data: imageUrl, isLoading } = useAttachment(task._id, hasAttachment);

  if (!hasAttachment) return null;

  return (
    <div className="space-y-2 border-t pt-4">
      <p className="text-sm font-medium">Attachment</p>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : (
        <img
          src={imageUrl}
          alt={task.attachment?.filename || "Task attachment"}
          className="max-h-40 w-full rounded-lg border object-contain"
        />
      )}
    </div>
  );
}
