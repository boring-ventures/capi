"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "../user-avatar";
import { UserStatus } from "../user-status";
import { UserRating } from "../user-rating";
import { UserActions } from "../user-actions";
import { UserStats } from "./user-stats";
import { UserFilters } from "./user-filters";
import { UserPagination } from "./user-pagination";
import { useUsers, useCategories } from "@/hooks/useUsers";
import { useAdvancedUserFilters } from "@/hooks/useAdvancedUserFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Copy, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ColumnManager } from "./column-manager";
import { ExportExcelButton } from "./export-excel-button";
import { type User, type Column } from "@/types/user";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdvancedUsersTableProps {
  onDataChange?: (users: User[], filters: any, stats: any) => void;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "avatar", label: "Avatar", required: true },
  { id: "name", label: "Nombre", required: true },
  { id: "email", label: "Email" },
  { id: "phone", label: "Teléfono" },
  { id: "password", label: "Contraseña" },
  { id: "role", label: "Rol" },
  { id: "status", label: "Estado" },
  { id: "reviewStatus", label: "Estado de Revisión" },
  { id: "rating", label: "Calificación" },
  { id: "categories", label: "Categorías" },
  { id: "created_at", label: "Fecha de Registro" },
  { id: "actions", label: "Acciones", required: true }
];

export function AdvancedUsersTable({ onDataChange }: AdvancedUsersTableProps) {
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<{id: string, field: string} | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.map(col => col.id)
  );
  const router = useRouter();

  const { data: users = [], isLoading, error } = useUsers();
  const { data: categories = [] } = useCategories();

  // Get technician counts per category
  const technicianCountsByCategory = React.useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(user => {
      if (user.role === "technician" && Array.isArray(user.categoryIds)) {
        user.categoryIds.forEach((categoryId: string) => {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        });
      }
    });
    return counts;
  }, [users]);

  // Enhance categories with technician counts
  const enhancedCategories = React.useMemo(() => {
    return categories.map(category => ({
      ...category,
      technician_count: technicianCountsByCategory[category.id] || 0
    }));
  }, [categories, technicianCountsByCategory]);

  const {
    paginatedUsers,
    filteredUsers,
    stats,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    reviewStatusFilter,
    setReviewStatusFilter,
    selectedCategories,
    setSelectedCategories,
    dateFilter,
    setDateFilter,
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    activeFiltersCount,
    clearFilters,
    totalItems,
  } = useAdvancedUserFilters({ users });

  // Notify parent component of changes
  React.useEffect(() => {
    if (onDataChange) {
      const filters = {
        searchTerm,
        roleFilter,
        statusFilter,
        reviewStatusFilter,
        selectedCategories,
        dateFilter
      };
      onDataChange(filteredUsers, filters, stats);
    }
  }, [filteredUsers, stats, searchTerm, roleFilter, statusFilter, reviewStatusFilter, selectedCategories, dateFilter, onDataChange]);

  const handleColumnChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  // Function to copy text and show feedback
  const copyToClipboard = async (text: string, userId: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField({ id: userId, field });
      toast.success(`${field === 'both' ? 'Credenciales copiadas' : field === 'email' ? 'Correo copiado' : 'Contraseña copiada'}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Error al copiar al portapapeles");
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los usuarios. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Estadísticas */}
      <UserStats stats={stats} />

      {/* Filtros y Gestión de Columnas */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            reviewStatusFilter={reviewStatusFilter}
            setReviewStatusFilter={setReviewStatusFilter}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            categories={enhancedCategories}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
          />
        </div>
        <div className="flex items-center gap-2">
          <ExportExcelButton
            users={filteredUsers}
            visibleColumns={visibleColumns}
            columns={DEFAULT_COLUMNS}
          />
          <ColumnManager
            columns={DEFAULT_COLUMNS}
            visibleColumns={visibleColumns}
            onColumnChange={handleColumnChange}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.includes("avatar") && (
                <TableHead className="w-[50px]"></TableHead>
              )}
              {visibleColumns.includes("name") && (
                <TableHead>Nombre</TableHead>
              )}
              {visibleColumns.includes("email") && (
                <TableHead>Email</TableHead>
              )}
              {visibleColumns.includes("phone") && (
                <TableHead>Teléfono</TableHead>
              )}
              {visibleColumns.includes("password") && (
                <TableHead>Contraseña</TableHead>
              )}
              {visibleColumns.includes("role") && (
                <TableHead>Rol</TableHead>
              )}
              {visibleColumns.includes("status") && (
                <TableHead>Estado</TableHead>
              )}
              {visibleColumns.includes("reviewStatus") && (
                <TableHead>Estado de Revisión</TableHead>
              )}
              {visibleColumns.includes("rating") && (
                <TableHead>Calificación</TableHead>
              )}
              {visibleColumns.includes("categories") && (
                <TableHead>Categorías</TableHead>
              )}
              {visibleColumns.includes("created_at") && (
                <TableHead>Fecha de Registro</TableHead>
              )}
              {visibleColumns.includes("actions") && (
                <TableHead className="text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {visibleColumns.map((col) => (
                    <TableCell key={col}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  {visibleColumns.includes("avatar") && (
                    <TableCell>
                      <UserAvatar 
                        name={user.name} 
                        role={user.role} 
                        photoUrl={user.photo_url}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.includes("name") && (
                    <TableCell className="font-medium">{user.name}</TableCell>
                  )}
                  {visibleColumns.includes("email") && (
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="cursor-pointer hover:bg-muted px-2 py-1 rounded flex items-center gap-2"
                              onClick={() => copyToClipboard(user.email, user.id, 'email')}
                            >
                              {user.email}
                              {copiedField?.id === user.id && copiedField?.field === 'email' ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Click para copiar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                  {visibleColumns.includes("phone") && (
                    <TableCell>{user.phone || "N/A"}</TableCell>
                  )}
                  {visibleColumns.includes("password") && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className="cursor-pointer hover:bg-muted px-2 py-1 rounded flex items-center gap-2 font-mono"
                                onClick={() => showPassword[user.id] && copyToClipboard(user.password, user.id, 'password')}
                              >
                                {showPassword[user.id] ? (
                                  <>
                                    {user.password}
                                    {copiedField?.id === user.id && copiedField?.field === 'password' ? (
                                      <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                    )}
                                  </>
                                ) : '••••••••'}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{showPassword[user.id] ? 'Click para copiar' : 'Mostrar contraseña'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(prev => ({
                            ...prev,
                            [user.id]: !prev[user.id]
                          }))}
                        >
                          {showPassword[user.id] ? 'Ocultar' : 'Mostrar'}
                        </Button>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes("role") && (
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === "technician" ? "Técnico" : "Cliente"}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes("status") && (
                    <TableCell>
                      <UserStatus status={user.status} />
                    </TableCell>
                  )}
                  {visibleColumns.includes("reviewStatus") && (
                    <TableCell>
                      {user.role === "technician" ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => router.push(`/dashboard/users/review/${user.id}`)}
                        >
                          <Badge
                            variant={
                              user.reviewStatus === "approved"
                                ? "success"
                                : user.reviewStatus === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {user.reviewStatus === "pending"
                              ? "Pendiente"
                              : user.reviewStatus === "approved"
                              ? "Aprobado"
                              : user.reviewStatus === "accepted"
                              ? "Aceptado"
                              : user.reviewStatus === "rejected"
                              ? "Rechazado"
                              : "N/A"}
                          </Badge>
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  )}
                  {visibleColumns.includes("rating") && (
                    <TableCell>
                      <UserRating rating={user.rating || 0} />
                    </TableCell>
                  )}
                  {visibleColumns.includes("categories") && (
                    <TableCell>
                      {user.categories?.join(", ") || "N/A"}
                    </TableCell>
                  )}
                  {visibleColumns.includes("created_at") && (
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleColumns.includes("actions") && (
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(`Email: ${user.email}\nContraseña: ${user.password}`, user.id, 'both')}
                              >
                                {copiedField?.id === user.id && copiedField?.field === 'both' ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copiar credenciales</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <UserActions user={user} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
} 