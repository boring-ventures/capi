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

// Get all users with technician work info and category names
export const getUsers = async () => {
  // Primero obtener todos los usuarios
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*");

  if (usersError) throw new Error(`Error fetching users: ${usersError.message}`);

  // Obtener información de trabajo de técnicos
  const { data: workInfo, error: workError } = await supabase
    .from("technician_work_info")
    .select("user_id, area_trabajo");

  if (workError) throw new Error(`Error fetching work info: ${workError.message}`);

  // Obtener todas las categorías
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name");

  if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`);

  // Crear un mapa de categorías por ID
  const categoryMap = new Map(categories?.map(cat => [cat.id, cat.name]) || []);

  // Combinar la información
  const usersWithCategories = users?.map(user => {
    const userWorkInfo = workInfo?.find(info => info.user_id === user.id);
    let categoryNames: string[] = [];

    if (userWorkInfo && Array.isArray(userWorkInfo.area_trabajo)) {
      categoryNames = userWorkInfo.area_trabajo
        .map(categoryId => categoryMap.get(categoryId))
        .filter(Boolean) as string[];
    }

    return {
      ...user,
      categories: categoryNames,
      categoryIds: userWorkInfo?.area_trabajo || []
    };
  });

  return usersWithCategories;
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
