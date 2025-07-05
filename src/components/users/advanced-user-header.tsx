"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, RefreshCw, BarChart3 } from "lucide-react";
import { CreateTechnicianModal } from "../create-technician-modal";
import UserTypeDialog from "../user-type-dialog";
import { ExportExcelButton } from "./export-excel-button";
import { Badge } from "@/components/ui/badge";
import { type Column } from "@/types/user";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  technicians: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    accepted: number;
  };
  clients: {
    total: number;
  };
  todayRegistrations: number;
}

interface AdvancedUserHeaderProps {
  users?: any[];
  stats?: UserStats;
  filters?: {
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
    reviewStatusFilter: string;
    categoryFilter?: string;
    dateFilter: string;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AdvancedUserHeader({
  users = [],
  stats,
  filters,
  isLoading = false,
  onRefresh,
}: AdvancedUserHeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);

  const handleUserTypeSelected = (type: string) => {
    if (type === "Tecnico") {
      setIsCreateModalOpen(true);
    }
  };

  const defaultFilters = {
    searchTerm: "",
    roleFilter: "todos",
    statusFilter: "todos",
    reviewStatusFilter: "todos",
    categoryFilter: "todas",
    dateFilter: "todos",
  };

  const currentFilters = filters || defaultFilters;

  // Calcular estadísticas rápidas para mostrar en el header
  const getActiveFiltersText = () => {
    const activeFilters = [];
    if (currentFilters.searchTerm)
      activeFilters.push(`"${currentFilters.searchTerm}"`);
    if (currentFilters.roleFilter !== "todos")
      activeFilters.push(currentFilters.roleFilter);
    if (currentFilters.statusFilter !== "todos")
      activeFilters.push(currentFilters.statusFilter);
    if (currentFilters.reviewStatusFilter !== "todos")
      activeFilters.push(currentFilters.reviewStatusFilter);
    if (currentFilters.dateFilter !== "todos")
      activeFilters.push(currentFilters.dateFilter);

    return activeFilters.length > 0 ? activeFilters.join(", ") : null;
  };

  const activeFiltersText = getActiveFiltersText();

  // Add columns configuration
  const columns: Column[] = [
    { id: "name", label: "Nombre", required: true },
    { id: "email", label: "Email", required: true },
    { id: "phone", label: "Teléfono" },
    { id: "role", label: "Rol" },
    { id: "status", label: "Estado" },
    { id: "reviewStatus", label: "Estado de Revisión" },
    { id: "rating", label: "Calificación" },
    { id: "categories", label: "Categorías" },
    { id: "created_at", label: "Fecha de Registro" }
  ];

  // Default visible columns
  const visibleColumns = columns.map(col => col.id);

  return (
    <>
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {users.length} usuarios
                {activeFiltersText && (
                  <span className="ml-1">
                    filtrados por:{" "}
                    <span className="font-medium">{activeFiltersText}</span>
                  </span>
                )}
              </p>
              {stats && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stats.technicians.total} técnicos
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats.clients.total} clientes
                  </Badge>
                  {stats.todayRegistrations > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{stats.todayRegistrations} hoy
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            )}
            <ExportExcelButton 
              users={users}
              visibleColumns={visibleColumns}
              columns={columns}
            />
            <Button onClick={() => setIsTypeDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Barra de estado rápida */}
        {stats && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Estado general:</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {stats.active} activos
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                {stats.inactive} inactivos
              </span>
              {currentFilters.roleFilter === "technician" && (
                <>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    {stats.technicians.pending} pendientes
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {stats.technicians.approved} aprobados
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {stats.technicians.rejected} rechazados
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <UserTypeDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        onSelect={handleUserTypeSelected}
      />

      <CreateTechnicianModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
