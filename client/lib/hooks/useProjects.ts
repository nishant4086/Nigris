import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export type Project = {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data as Project[];
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: { name: string; description?: string }) => {
      const res = await api.post("/projects", newProject);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
