export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "technician" | "client";
  status: "active" | "inactive";
  reviewStatus?: "pending" | "rejected" | "approved" | "accepted";
  rating?: number;
  categoryIds?: string[];
  categories?: string[];
  created_at: string;
  photo_url?: string;
}

export interface Column {
  id: string;
  label: string;
  required?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  technician_count?: number;
}

export interface UserStats {
  total: number;
  technicians: number;
  clients: number;
  active: number;
  inactive: number;
  pending: number;
  approved: number;
  rejected: number;
  todayRegistrations: number;
} 