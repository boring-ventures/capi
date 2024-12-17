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

    const { error: uploadError } = await supabase.storage
      .from("docsTechnician")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("docsTechnician")
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