"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  reviewStatus: string;
  rating: number;
  categories?: string[];
  created_at: string;
}

interface ExportExcelButtonProps {
  users: User[];
  filters: {
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
    categoryFilter?: string;
  };
}

export function ExportExcelButton({ users, filters }: ExportExcelButtonProps) {
  const handleExport = () => {
    // Preparar los datos para Excel
    const excelData = users.map(user => ({
      'Nombre': user.name,
      'Correo': user.email,
      'Teléfono': user.phone || 'N/A',
      'Rol': user.role === 'client' ? 'Cliente' : 'Técnico',
      'Estado': user.status === 'active' ? 'Activo' : 'Inactivo',
      'Estado de Revisión': 
        user.reviewStatus === 'pending' ? 'Pendiente' :
        user.reviewStatus === 'approved' ? 'Aprobado' :
        user.reviewStatus === 'accepted' ? 'Aceptado' :
        user.reviewStatus === 'rejected' ? 'Rechazado' : user.reviewStatus,
      'Calificación': user.rating || 0,
      'Categorías': user.categories?.join(', ') || 'N/A',
      'Fecha de Creación': new Date(user.created_at).toLocaleDateString('es-ES')
    }));

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar el ancho de las columnas
    const colWidths = [
      { wch: 20 }, // Nombre
      { wch: 25 }, // Correo
      { wch: 15 }, // Teléfono
      { wch: 10 }, // Rol
      { wch: 12 }, // Estado
      { wch: 18 }, // Estado de Revisión
      { wch: 12 }, // Calificación
      { wch: 30 }, // Categorías
      { wch: 18 }, // Fecha de Creación
    ];
    ws['!cols'] = colWidths;

    // Agregar el worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Usuarios");

    // Crear nombre del archivo con timestamp y filtros activos
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    
    let filename = `usuarios_${timestamp}`;
    
    // Agregar información de filtros al nombre del archivo
    const activeFilters = [];
    if (filters.searchTerm) activeFilters.push(`busqueda-${filters.searchTerm.replace(/\s+/g, '_')}`);
    if (filters.roleFilter !== 'todos') activeFilters.push(`rol-${filters.roleFilter}`);
    if (filters.statusFilter !== 'todos') activeFilters.push(`estado-${filters.statusFilter}`);
    if (filters.categoryFilter && filters.categoryFilter !== 'todas') activeFilters.push(`categoria-${filters.categoryFilter.replace(/\s+/g, '_')}`);
    
    if (activeFilters.length > 0) {
      filename += `_filtros-${activeFilters.join('_')}`;
    }
    
    filename += '.xlsx';

    // Generar y descargar el archivo
    XLSX.writeFile(wb, filename);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Exportar Excel
    </Button>
  );
} 