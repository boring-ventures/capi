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
import { InterventionModal } from "@/components/intervention-modal";

const initialCategories = [
  {
    id: "1",
    name: "Electricidad",
    subcategories: [
      {
        id: "1-1",
        name: "Instalaciones",
        minimumPrice: 50,
        activeServices: 12,
      },
      {
        id: "1-2",
        name: "Reparaciones",
        minimumPrice: 30,
        activeServices: 8,
      },
    ],
  },
  {
    id: "2",
    name: "Plomería",
    subcategories: [],
  },
];

const mockServices = [
  {
    id: "1234",
    status: "En Progreso",
    client: "Juan Pérez",
    technician: "Miguel Rodriguez",
    category: "Electricidad",
    price: 150,
  },
  {
    id: "1235",
    status: "Pendiente",
    client: "María García",
    technician: "Carlos López",
    category: "Plomería",
    price: 200,
  },
];

export default function ServicesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  const handleAddCategory = (name: string, minimumPrice: number) => {
    const newCategory = {
      id: Math.random().toString(),
      name,
      subcategories: [],
    };
    setCategories([...categories, newCategory]);
  };

  const handleFilterChange = (status: string) => {
    console.log("Filter changed:", status);
  };

  const handleViewDetails = (id: string) => {
    const service = mockServices.find((s) => s.id === id);
    if (service) {
      setSelectedService({
        ...service,
        date: "2024-01-08",
        client: {
          name: service.client,
          phone: "123-456-7890",
          address: "Calle Principal #123",
        },
        technician: {
          name: service.technician,
          phone: "098-765-4321",
          rating: 4,
        },
        offers: {
          initial: service.price - 20,
          counter: service.price,
          accepted: true,
        },
      });
      setIsDetailsModalOpen(true);
    }
  };

  const handleIntervene = (id: string) => {
    const service = mockServices.find((s) => s.id === id);
    if (service) {
      setSelectedService(service);
      setIsInterventionModalOpen(true);
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
            <Categories initialCategories={categories} />
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Todas las solicitudes</h2>
            <FilterToolbar
              onFilterChange={handleFilterChange}
              onFilterClick={() => console.log("Filter clicked")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  onViewDetails={handleViewDetails}
                  onIntervene={handleIntervene}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="disputes">
          <DisputesPanel />
        </TabsContent>
      </Tabs>

      {selectedService && (
        <>
          <ServiceDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            service={selectedService}
          />
          <InterventionModal
            isOpen={isInterventionModalOpen}
            onClose={() => setIsInterventionModalOpen(false)}
            serviceId={selectedService.id}
            client={selectedService.client}
            technician={selectedService.technician}
            description="Descripción del problema..."
          />
        </>
      )}

      <AddCategoryDialog
        open={isAddingCategory}
        onOpenChange={setIsAddingCategory}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
