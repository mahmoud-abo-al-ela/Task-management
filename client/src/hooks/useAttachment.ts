import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// An <img src> cannot send the Authorization header, so the image is fetched
// with axios as a blob and turned into a local object URL instead.
// Uploading and removing happen through the task form, in the same request
// that saves the task.
export function useAttachment(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["attachment", taskId],
    enabled,
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/attachment`, {
        responseType: "blob",
      });
      return URL.createObjectURL(res.data);
    },
  });
}
