import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api, { getErrorMessage } from "@/lib/api";
import type { Task, TasksResponse, TaskStatus } from "@/types";

export interface TaskFilters {
  search: string;
  status: string;
  priority: string;
  page: number;
  limit: number;
}

export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/tasks", { params: filters });
      return res.data;
    },
    placeholderData: (previous) => previous,
  });
}

export interface TaskInput {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  image?: File | null;
  removeAttachment?: boolean;
}

function toRequestBody(data: TaskInput) {
  if (!data.image && !data.removeAttachment) return data;

  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("status", data.status);
  formData.append("priority", data.priority);
  formData.append("dueDate", data.dueDate ?? "");

  if (data.image) formData.append("image", data.image);
  if (data.removeAttachment) formData.append("removeAttachment", "true");

  return formData;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskInput) => {
      const res = await api.post<Task>("/tasks", toRequestBody(data));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskInput }) => {
      const res = await api.patch<Task>(`/tasks/${id}`, toRequestBody(data));
      return res.data;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["attachment", task._id] });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.patch(`/tasks/${id}`, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      const previous = queryClient.getQueriesData<TasksResponse>({
        queryKey: ["tasks"],
      });

      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ["tasks"] },
        (data) =>
          data && {
            ...data,
            tasks: data.tasks.map((task) =>
              task._id === id ? { ...task, status } : task,
            ),
          },
      );

      return { previous };
    },

    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, tasks]) =>
        queryClient.setQueryData(key, tasks),
      );
      toast.error(getErrorMessage(error));
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
