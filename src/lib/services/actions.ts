import { supabase } from "@/utils/supabaseClient";

export type ServiceStatus = "created" | "in_progress" | "completed" | "canceled" | "disputed";

export interface Service {
  id: string;
  status: ServiceStatus;
  category_id: string;
  subcategory_id: string;
  client_id: string;
  technician_id?: string;
  location_id: string;
  request_date: string;
  acceptance_date?: string;
  agreed_price?: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceWithDetails extends Service {
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
  };
  location: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  images: {
    id: string;
    image_url: string;
    upload_date: string;
  }[];
}

export async function createService(serviceData: Omit<Service, "id" | "created_at" | "updated_at">): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .insert([serviceData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getServices(): Promise<ServiceWithDetails[]> {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      category:categories(id, name),
      subcategory:subcategories(id, name),
      client:users!client_id(id, name, email, phone, rating),
      technician:users!technician_id(id, name, email, phone, rating),
      location:locations(id, name, address, latitude, longitude),
      images:service_images(id, image_url, upload_date)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getServiceById(id: string): Promise<ServiceWithDetails> {
  const { data, error } = await supabase
    .from("services")
    .select(`
      *,
      category:categories(id, name),
      subcategory:subcategories(id, name),
      client:users!client_id(id, name, email, phone, rating),
      technician:users!technician_id(id, name, email, phone, rating),
      location:locations(id, name, address, latitude, longitude),
      images:service_images(id, image_url, upload_date)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateServiceStatus(id: string, status: ServiceStatus): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function assignTechnician(serviceId: string, technicianId: string): Promise<Service> {
  const { data, error } = await supabase
    .from("services")
    .update({
      technician_id: technicianId,
      status: "in_progress",
      acceptance_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", serviceId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function addServiceImages(
  serviceId: string,
  imageUrls: string[]
): Promise<void> {
  const images = imageUrls.map(url => ({
    service_id: serviceId,
    image_url: url
  }));

  const { error } = await supabase
    .from("service_images")
    .insert(images);

  if (error) throw new Error(error.message);
} 