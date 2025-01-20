import { supabase } from "@/utils/supabaseClient";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Category = {
    id: string;
    name: string;
    subcategories: any;
};

export async function createCategory(name: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  // Primero verificar si hay técnicos asociados
  const { data: technicians, error: techError } = await supabase
    .from("technician_work_info")
    .select("id")
    .eq("category_id", id)
    .limit(1);

  if (techError) throw new Error(techError.message);

  // Si hay técnicos asociados, no permitir la eliminación
  if (technicians && technicians.length > 0) {
    throw new Error("No se puede eliminar la categoría porque hay técnicos asociados a ella");
  }

  // Si no hay técnicos, proceder con la eliminación
  // Las subcategorías se eliminarán automáticamente por la restricción ON DELETE CASCADE
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
} 