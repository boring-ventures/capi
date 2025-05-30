import { supabase } from "./supabaseClient";

export const uploadFile = async (
  file: File,
  userId: string,
  path: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${path}/${fileName}`;

    // Seleccionar el bucket correcto según el tipo de archivo
    const bucket = path === "profile-photos" ? "profilePictures" : "docsTechnician";

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from("docsTechnician")
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export const getFilesByUserId = async (userId: string, path?: string): Promise<string[]> => {
  try {
    const searchPath = path ? `${userId}/${path}` : userId;
    const { data, error } = await supabase.storage
      .from("docsTechnician")
      .list(searchPath);

    if (error) throw error;

    return data.map(file => {
      const { data: urlData } = supabase.storage
        .from("docsTechnician")
        .getPublicUrl(`${searchPath}/${file.name}`);
      return urlData.publicUrl;
    });
  } catch (error) {
    console.error("Error getting files:", error);
    return [];
  }
};

export const uploadProfilePhoto = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Subir al bucket de fotos de perfil
    const { error: uploadError } = await supabase.storage
      .from("profilePictures")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("profilePictures")
      .getPublicUrl(filePath);

    // Registrar en la tabla user_profile_photos
    const { error: dbError } = await supabase
      .from("user_profile_photos")
      .upsert({
        user_id: userId,
        photo_url: data.publicUrl,
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      throw dbError;
    }

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return null;
  }
};

export const uploadCategoryLogo = async (
  file: File,
  categoryId: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${categoryId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("categoryLogos")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("categoryLogos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading category logo:", error);
    return null;
  }
}; 