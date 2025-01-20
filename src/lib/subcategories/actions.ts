import { supabase } from "@/utils/supabaseClient";

export type Subcategory = {
  id: string;
  name: string;
  minimumPrice: number;
  activeServices: number;
  category_id: string;
};

export async function createSubcategory(
  categoryId: string,
  name: string,
  minimumPrice: number
): Promise<Subcategory> {
  const { data, error } = await supabase
    .from("subcategories")
    .insert([
      { 
        name, 
        minimum_price: minimumPrice,
        category_id: categoryId,
        active_services: 0
      }
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return {
    id: data.id,
    name: data.name,
    minimumPrice: data.minimum_price,
    activeServices: data.active_services,
    category_id: data.category_id
  };
}

export async function getSubcategories(categoryId: string): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("name");

  if (error) throw new Error(error.message);
  
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    minimumPrice: item.minimum_price,
    activeServices: item.active_services,
    category_id: item.category_id
  }));
}

export async function updateSubcategory(
  id: string,
  name: string,
  minimumPrice: number
): Promise<Subcategory> {
  const { data, error } = await supabase
    .from("subcategories")
    .update({ 
      name,
      minimum_price: minimumPrice
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return {
    id: data.id,
    name: data.name,
    minimumPrice: data.minimum_price,
    activeServices: data.active_services,
    category_id: data.category_id
  };
}

export async function deleteSubcategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("subcategories")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
} 