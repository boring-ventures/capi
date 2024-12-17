import { supabase } from "@/utils/supabaseClient";
import { createUser } from "../users/actions";

interface TechnicianData {
  // Personal Info
  nombre: string;
  apellido: string;
  correoElectronico: string;
  telefono: string;
  direccion: string;
  // Work Info
  areaTrabajo: string;
  anosExperiencia: string;
  nombreBanco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  // Document URLs
  carnetIdentidadAnversoUrl?: string;
  carnetIdentidadReversoUrl?: string;
  facturaLuzUrl?: string;
  certificacionesUrls?: string[];
}

export const createTechnician = async (technicianData: TechnicianData) => {
  try {
    // 1. Crear el usuario base primero
    const userData = {
      name: `${technicianData.nombre} ${technicianData.apellido}`,
      email: technicianData.correoElectronico,
      phone: technicianData.telefono,
      role: "Technician",
      status: "Active",
    };

    const user = await createUser(userData);
    if (!user) throw new Error("Failed to create user");
    const userId = (user as any[])[0].id;

    // 2. Crear el registro de documentos
    const { data: docsData, error: docsError } = await supabase
      .from("technician_documents")
      .insert({
        user_id: userId,
        carnet_identidad_anverso: technicianData.carnetIdentidadAnversoUrl,
        carnet_identidad_reverso: technicianData.carnetIdentidadReversoUrl,
        factura_luz: technicianData.facturaLuzUrl,
        certificaciones: technicianData.certificacionesUrls,
      });

    if (docsError) throw docsError;

    // 3. Crear el registro de información laboral
    const { data: workData, error: workError } = await supabase
      .from("technician_work_info")
      .insert({
        user_id: userId,
        area_trabajo: technicianData.areaTrabajo,
        anos_experiencia: technicianData.anosExperiencia,
        nombre_banco: technicianData.nombreBanco,
        numero_cuenta: technicianData.numeroCuenta,
        tipo_cuenta: technicianData.tipoCuenta,
      });

    if (workError) throw workError;

    return { userId, docsData, workData };
  } catch (error) {
    console.error("Error creating technician:", error);
    throw error;
  }
};

export const getTechnicianById = async (userId: string) => {
  try {
    // Obtener información del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    // Obtener documentos
    const { data: docsData, error: docsError } = await supabase
      .from("technician_documents")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (docsError) throw docsError;

    // Obtener información laboral
    const { data: workData, error: workError } = await supabase
      .from("technician_work_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (workError) throw workError;

    return {
      ...userData,
      documents: docsData,
      workInfo: workData,
    };
  } catch (error) {
    console.error("Error fetching technician:", error);
    throw error;
  }
};

export const getAllTechnicians = async () => {
  try {
    const { data: technicians, error } = await supabase
      .from("users")
      .select(`
        *,
        technician_documents (*),
        technician_work_info (*)
      `)
      .eq("role", "Technician");

    if (error) throw error;
    return technicians;
  } catch (error) {
    console.error("Error fetching technicians:", error);
    throw error;
  }
};

export const updateTechnicianDocuments = async (
  userId: string,
  documents: Partial<{
    carnet_identidad_anverso: string;
    carnet_identidad_reverso: string;
    factura_luz: string;
    certificaciones: string[];
  }>
) => {
  try {
    const { data, error } = await supabase
      .from("technician_documents")
      .update(documents)
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating technician documents:", error);
    throw error;
  }
};

export const updateTechnicianWorkInfo = async (
  userId: string,
  workInfo: Partial<{
    area_trabajo: string;
    anos_experiencia: string;
    nombre_banco: string;
    numero_cuenta: string;
    tipo_cuenta: string;
  }>
) => {
  try {
    const { data, error } = await supabase
      .from("technician_work_info")
      .update(workInfo)
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating technician work info:", error);
    throw error;
  }
}; 