// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";
import { type User, type Category } from "@/types/user";
import { toast } from "sonner";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          phone,
          role,
          status,
          reviewStatus,
          rating,
          created_at,
          technician_work_info (
            area_trabajo
          )
        `);

      if (error) throw error;

      // Ensure all required fields are present and transform the data
      return data.map(user => ({
        ...user,
        phone: user.phone || "",
        role: user.role || "client",
        status: user.status || "inactive",
        // Extract categories from technician_work_info if it exists
        categoryIds: user.role === "technician" && user.technician_work_info?.length > 0 
          ? user.technician_work_info[0].area_trabajo
          : [],
        // We'll fetch category details separately if needed
        categories: [],
        // Remove the technician_work_info from the final object
        technician_work_info: undefined
      })) as User[];
    },
  });
}

export function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ["users", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          phone,
          role,
          status,
          reviewStatus,
          rating,
          created_at,
          technician_work_info (
            area_trabajo
          )
        `)
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Ensure all required fields are present
      return {
        ...data,
        phone: data.phone || "",
        role: data.role || "client",
        status: data.status || "inactive",
        // Extract categories from technician_work_info if it exists
        categoryIds: data.role === "technician" && data.technician_work_info?.length > 0 
          ? data.technician_work_info[0].area_trabajo
          : [],
        // We'll fetch category details separately if needed
        categories: [],
        // Remove the technician_work_info from the final object
        technician_work_info: undefined
      } as User;
    },
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          id,
          name,
          image_url
        `);

      if (error) throw error;

      return data as Category[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<User, "id" | "created_at">) => {
      const { error } = await supabase
        .from("users")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error("Error al crear el usuario");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const { error } = await supabase
        .from("users")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar el usuario");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuario eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar el usuario");
    },
  });
}
