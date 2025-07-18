"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceFilters } from "./service-filters";
import { ServicePagination } from "./service-pagination";
import { useServices } from "@/hooks/useServices";
import { useAdvancedServiceFilters } from "@/hooks/useAdvancedServiceFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Eye, Edit, MoreHorizontal, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ServiceWithDetails } from "@/lib/services/actions";
import { serviceStatusMap } from "@/lib/services/utils";
import { EditServiceModal } from "@/components/edit-service-modal";
import { ServiceLocationModal } from "@/components/service-location-modal";
import { ServiceDetailsModal } from "@/components/service-details-modal";

export function AdvancedServicesTable() {
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { data: services = [], isLoading, error } = useServices();

  const {
    paginatedServices,
    filteredServices,
    stats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    technicianFilter,
    setTechnicianFilter,
    priceRange,
    setPriceRange,
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
  } = useAdvancedServiceFilters({ services });

  // Extraer categorías y técnicos únicos para los filtros
  const uniqueCategories = useMemo(() => {
    const categories = new Map();
    services.forEach(service => {
      if (!categories.has(service.category.id)) {
        categories.set(service.category.id, service.category);
      }
    });
    return Array.from(categories.values());
  }, [services]);

  const uniqueTechnicians = useMemo(() => {
    const technicians = new Map();
    services.forEach(service => {
      if (service.technician && !technicians.has(service.technician.id)) {
        technicians.set(service.technician.id, service.technician);
      }
    });
    return Array.from(technicians.values());
  }, [services]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleViewDetails = (service: ServiceWithDetails) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const handleEditService = (service: ServiceWithDetails) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleViewLocation = (service: ServiceWithDetails) => {
    setSelectedService(service);
    setIsLocationModalOpen(true);
  };

  const handleServiceUpdated = () => {
    // Refrescar la lista de servicios cuando se actualice uno
    // El useServices hook ya maneja la actualización automática
  };

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      created: "secondary",
      in_progress: "default",
      completed: "outline",
      canceled: "destructive",
      disputed: "destructive",
    };
    return variants[status] || "secondary";
  };

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los servicios. Por favor, intenta nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <ServiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        technicianFilter={technicianFilter}
        setTechnicianFilter={setTechnicianFilter}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        activeFiltersCount={activeFiltersCount}
        clearFilters={clearFilters}
        categories={uniqueCategories}
        technicians={uniqueTechnicians}
      />

      {/* Tabla de Servicios */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                    No se encontraron servicios con los filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      #{service.id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {service.client.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{service.client.name}</div>
                          <div className="text-sm text-gray-500">{service.client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.technician ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {service.technician.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{service.technician.name}</div>
                            <div className="text-sm text-gray-500">
                              ⭐ {service.technician.rating || "N/A"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.category.name}</div>
                        {service.subcategory && (
                          <div className="text-sm text-gray-500">{service.subcategory.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(service.status)}>
                        {serviceStatusMap[service.status]?.label || service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(service.request_date)}</div>
                        {service.completion_date && (
                          <div className="text-gray-500">
                            Completado: {formatDate(service.completion_date)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {service.agreed_price ? (
                        <div className="font-medium">
                          {formatCurrency(service.agreed_price)}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No definido</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{service.location.address}</div>
                        <div className="text-gray-500">
                          {service.location.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(service)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditService(service)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewLocation(service)}>
                            <MapPin className="h-4 w-4 mr-2" />
                            Ver ubicación
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Paginación */}
      <ServicePagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Edición de Servicio */}
      <EditServiceModal
        service={selectedService}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onServiceUpdated={handleServiceUpdated}
      />

      {/* Modal de Ubicación del Servicio */}
      <ServiceLocationModal
        service={selectedService}
        open={isLocationModalOpen}
        onOpenChange={setIsLocationModalOpen}
      />

      {/* Modal de Detalles del Servicio */}
      {selectedService && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          service={selectedService}
        />
      )}
    </div>
  );
} 