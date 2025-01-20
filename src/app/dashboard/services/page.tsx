"use client";

import { useState } from "react";
import { Categories } from "@/components/categories";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterToolbar } from "@/components/filter-toolbar";
import { ServiceCard } from "@/components/service-card";
import { DisputesPanel } from "@/components/disputes-panel";
import { ServiceDetailsModal } from "@/components/service-details-modal";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import type { ServiceWithDetails } from "@/lib/services/actions";

export default function ServicesPage() {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const { data: services, isLoading } = useServices();

  const handleFilterChange = (status: string) => {
    console.log("Filter changed:", status);
  };

  const handleViewDetails = (id: string) => {
    const service = services?.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Servicios</h1>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">
            Categorías y Subcategorías
          </TabsTrigger>
          <TabsTrigger value="services">Control de Solicitudes</TabsTrigger>
          <TabsTrigger value="disputes">Resolución de Disputas</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Categorías y Subcategorías</h2>
            <div className="flex justify-end mb-6">
              <Button onClick={() => setIsAddingCategory(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Categoría
              </Button>
            </div>
            <Categories key={refreshKey} />
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Solicitudes Recientes</h2>
            {/* <FilterToolbar
              onFilterChange={handleFilterChange}
              onFilterClick={() => console.log("Filter clicked")}
            /> */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando servicios...
              </div>
            ) : services && services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    status={service.status}
                    client={service.client.name}
                    technician={service.technician?.name ?? "Sin asignar"}
                    category={service.category.name}
                    price={service.agreed_price ?? 0}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay servicios disponibles
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="disputes">
          <DisputesPanel />
        </TabsContent>
      </Tabs>

      {selectedService && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          service={selectedService}
        />
      )}

      <AddCategoryDialog
        open={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        onAdd={async (name) => {
          setIsAddingCategory(false);
          setRefreshKey(prev => prev + 1);
          toast({
            title: "Categoría creada",
            description: "La categoría se ha creado exitosamente.",
          });
        }}
      />
    </div>
  );
}
