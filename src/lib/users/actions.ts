import { supabase } from "@/utils/supabaseClient";

interface CreateUserResponse {
  data: any[] | null;
  error: any | null;
  status: number;
  statusText: string;
}

// Create a new user
export const createUser = async (userData: any): Promise<CreateUserResponse> => {
  try {
    console.log('userData: ', userData);
    const { data, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: error.message,
        status: Number(error.code) || 400,
        statusText: "Error al crear el usuario"
      };
    }

    return {
      data: [data],
      error: null,
      status: 201,
      statusText: "El usuario se creó con éxito"
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message,
      status: 500,
      statusText: "Error interno del servidor"
    };
  }
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
