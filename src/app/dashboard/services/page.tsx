"use client";

import { useState, useCallback } from "react";
import { Categories } from "@/components/categories";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputesPanel } from "@/components/disputes-panel";
import { ServiceDetailsModal } from "@/components/service-details-modal";
import { AdvancedServiceHeader } from "@/components/services/advanced-service-header";
import { AdvancedServicesTable } from "@/components/services/advanced-services-table";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";
import type { ServiceWithDetails } from "@/lib/services/actions";

export default function ServicesPage() {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { toast } = useToast();
  const { data: services, isLoading, refetch } = useServices();

  const handleRefresh = useCallback(() => {
    refetch();
    setRefreshKey(prev => prev + 1);
  }, [refetch]);

  const handleViewDetails = (id: string) => {
    const service = services?.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Control de Servicios</TabsTrigger>
          <TabsTrigger value="categories">Categorías y Subcategorías</TabsTrigger>
          <TabsTrigger value="disputes">Resolución de Disputas</TabsTrigger>
        </TabsList>

        {/* TAB PRINCIPAL: Control de Servicios Avanzado */}
        <TabsContent value="services" className="space-y-6">
          <AdvancedServiceHeader
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
          
          <AdvancedServicesTable />
        </TabsContent>

        {/* TAB: Categorías y Subcategorías (Mejorado) */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Categorías y Subcategorías</h2>
              <p className="text-gray-600 mt-1">
                Gestiona las categorías de servicios y sus subcategorías asociadas
              </p>
            </div>
            <Button onClick={() => setIsAddingCategory(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Categoría
            </Button>
          </div>
          
          <Categories key={refreshKey} />
        </TabsContent>

        {/* TAB: Resolución de Disputas */}
        <TabsContent value="disputes" className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Resolución de Disputas</h2>
            <p className="text-gray-600 mb-6">
              Gestiona y resuelve las disputas de servicios reportadas por clientes y técnicos
            </p>
          </div>
          
          <DisputesPanel />
        </TabsContent>
      </Tabs>

      {/* Modal de Detalles de Servicio */}
      {selectedService && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          service={selectedService}
        />
      )}

      {/* Modal de Agregar Categoría */}
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
