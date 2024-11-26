import { supabase } from "@/utils/supabaseClient";

// Create a new user
export const createUser = async (userData: any) => {
  const { data, error } = await supabase.from("users").insert(userData);

  if (error) throw new Error(`Error creating user: ${error.message}`);
  return data;
};

// Get all users
export const getUsers = async () => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) throw new Error(`Error fetching users: ${error.message}`);
  return data;
};

// Get a user by ID
export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error fetching user: ${error.message}`);
  return data;
};

// Update a user
export const updateUser = async (id: string, updatedData: any) => {
  const { data, error } = await supabase
    .from("users")
    .update(updatedData)
    .eq("id", id);

  if (error) throw new Error(`Error updating user: ${error.message}`);
  return data;
};

// Delete a user
export const deleteUser = async (id: string) => {
  const { data, error } = await supabase.from("users").delete().eq("id", id);

  if (error) throw new Error(`Error deleting user: ${error.message}`);
  return data;
};
