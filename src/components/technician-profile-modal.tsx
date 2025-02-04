"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserAvatar } from "./user-avatar";
import { UserRating } from "./user-rating";
import { User, AlertCircle, Briefcase, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

interface Service {
  id: string;
  status: string;
  created_at: string;
  category: {
    name: string;
  };
}

interface TechnicianProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technician: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    created_at: string;
    photo_url?: string;
  };
}

export function TechnicianProfileModal({
  open,
  onOpenChange,
  technician,
}: TechnicianProfileModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [activeServicesCount, setActiveServicesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data: servicesData, error } = await supabase
          .from("services")
          .select(
            `
            id,
            status,
            created_at,
            category:categories!inner(name)
          `
          )
          .eq("technician_id", technician.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedServices = (servicesData || []).map((service: any) => ({
          id: service.id,
          status: service.status,
          created_at: service.created_at,
          category: {
            name: service.category?.name || ''
          }
        }));

        setServices(formattedServices);
        const activeCount = formattedServices.filter(
          (service) =>
            service.status === "active" || service.status === "in_progress"
        ).length;
        setActiveServicesCount(activeCount);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open && technician.id) {
      fetchServices();
    }
  }, [open, technician.id]);

  const EmptyStateMessage = ({ message }: { message: string }) => (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Perfil del Técnico</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              {technician.photo_url ? (
                <img
                  src={technician.photo_url}
                  alt={technician.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <h2 className="text-2xl font-bold">{technician.name}</h2>
              <Badge variant="secondary">Técnico</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Correo:</h3>
                <p className="text-muted-foreground">{technician.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Teléfono:</h3>
                <p className="text-muted-foreground">{technician.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold">Dirección:</h3>
                <p className="text-muted-foreground">
                  {technician.address || "No especificada"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Fecha de registro:</h3>
                <p className="text-muted-foreground">
                  {formatDate(technician.created_at)}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Servicios Activos:</h3>
                <Badge variant="default" className="mt-1">
                  {activeServicesCount} servicio
                  {activeServicesCount !== 1 ? "s" : ""} activo
                  {activeServicesCount !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs defaultValue="services" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">
                <Briefcase className="w-4 h-4 mr-2" />
                Historial de Servicios
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Star className="w-4 h-4 mr-2" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                  <div className="h-12 bg-muted animate-pulse rounded" />
                  <div className="h-12 bg-muted animate-pulse rounded" />
                </div>
              ) : services.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Servicio</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          {service.id}
                        </TableCell>
                        <TableCell>{service.category?.name}</TableCell>
                        <TableCell>{formatDate(service.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              service.status === "completed"
                                ? "default"
                                : service.status === "active"
                                ? "secondary"
                                : service.status === "in_progress"
                                ? "secondary"
                                : "secondary"
                            }
                          >
                            {service.status === "completed"
                              ? "Completado"
                              : service.status === "active"
                              ? "Activo"
                              : service.status === "in_progress"
                              ? "En Progreso"
                              : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyStateMessage message="Este técnico aún no ha realizado ningún servicio." />
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Total de Servicios</h3>
                  <p className="text-3xl font-bold">{services.length}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Servicios Activos</h3>
                  <p className="text-3xl font-bold">{activeServicesCount}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Servicios Completados</h3>
                  <p className="text-3xl font-bold">
                    {services.filter((s) => s.status === "completed").length}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">En Progreso</h3>
                  <p className="text-3xl font-bold">
                    {services.filter((s) => s.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
