"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUpdateUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { UserAvatar } from "../user-avatar";
import { UserStatus } from "../user-status";
import { UserRating } from "../user-rating";
import { getTechnicianById } from "@/lib/technicians/actions";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/utils/supabaseClient";

interface Category {
  id: string;
  name: string;
}

interface TechnicianInfo {
  workInfo: {
    area_trabajo: string[];
    anos_experiencia: string;
    nombre_banco: string | null;
    numero_cuenta: string | null;
    tipo_cuenta: string | null;
  };
  documents: {
    carnet_identidad_anverso: string;
    carnet_identidad_reverso: string;
    factura_luz: string;
    certificaciones: string[];
  };
}

export function ReviewDetails() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: user, isLoading: isLoadingUser } = useUser(userId);
  const [technicianInfo, setTechnicianInfo] = useState<TechnicianInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingTech, setIsLoadingTech] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateUser = useUpdateUser();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTechnicianInfo = async () => {
      if (user?.role === "technician") {
        try {
          const data = await getTechnicianById(userId);
          setTechnicianInfo(data);
        } catch (error) {
          console.error("Error fetching technician info:", error);
          toast.error("Error al cargar la información del técnico");
        } finally {
          setIsLoadingTech(false);
        }
      }
    };

    fetchTechnicianInfo();
  }, [userId, user?.role]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría no encontrada';
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await updateUser.mutateAsync({
        id: userId,
        data: { 
          reviewStatus: newStatus,
          status: newStatus === 'approved' ? 'active' : 'inactive'
        }
      });
      toast.success(`Técnico ${newStatus === 'approved' ? 'aprobado' : 'rechazado'} exitosamente`);
      router.push("/dashboard/users");
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast.error("Error al actualizar el estado del técnico");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoadingUser || isLoadingTech) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-muted-foreground">
          Usuario no encontrado
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Revisión de Técnico</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/users")}>
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <UserAvatar 
                name={user.name} 
                role={user.role} 
                photoUrl={user.photo_url}
              />
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p>{user.phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <UserStatus status={user.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calificación</p>
                <UserRating rating={user.rating || 0} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Trabajo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {technicianInfo?.workInfo ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Área de Trabajo</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.isArray(technicianInfo.workInfo.area_trabajo) ? (
                      technicianInfo.workInfo.area_trabajo.map((areaId) => (
                        <Badge key={areaId} variant="secondary">
                          {getCategoryName(areaId)}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">
                        {getCategoryName(technicianInfo.workInfo.area_trabajo)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Años de Experiencia</p>
                  <p className="mt-1">{technicianInfo.workInfo.anos_experiencia}</p>
                </div>

                {technicianInfo.workInfo.nombre_banco && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Banco</p>
                      <p className="mt-1">{technicianInfo.workInfo.nombre_banco}</p>
                    </div>
                    {technicianInfo.workInfo.numero_cuenta && (
                      <div>
                        <p className="text-sm text-muted-foreground">Número de Cuenta</p>
                        <p className="mt-1">{technicianInfo.workInfo.numero_cuenta}</p>
                      </div>
                    )}
                    {technicianInfo.workInfo.tipo_cuenta && (
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Cuenta</p>
                        <p className="mt-1">{technicianInfo.workInfo.tipo_cuenta}</p>
                      </div>
                    )}
                  </>
                )}

                {!technicianInfo.workInfo.nombre_banco && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground italic">
                      Información bancaria no proporcionada
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">
                No hay información de trabajo disponible
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {technicianInfo?.documents ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Documentos de Identidad</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {technicianInfo.documents.carnet_identidad_anverso && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Anverso</p>
                        <Image
                          src={technicianInfo.documents.carnet_identidad_anverso}
                          alt="Carnet de Identidad - Anverso"
                          className="rounded-md"
                        />
                      </div>
                    )}
                    {technicianInfo.documents.carnet_identidad_reverso && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Reverso</p>
                        <Image
                          src={technicianInfo.documents.carnet_identidad_reverso}
                          alt="Carnet de Identidad - Reverso"
                          className="rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Factura de Servicios</h3>
                  {technicianInfo.documents.factura_luz && (
                    <Image
                      src={technicianInfo.documents.factura_luz}
                      alt="Factura de Servicios"
                      className="rounded-md"
                    />
                  )}
                </div>

                {technicianInfo.documents.certificaciones?.length > 0 && (
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-medium">Certificaciones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {technicianInfo.documents.certificaciones.map((cert, index) => (
                        <div key={index}>
                          <Image
                            src={cert}
                            alt={`Certificación ${index + 1}`}
                            className="rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">
                No hay documentos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
            disabled={isUpdating}
          >
            Volver atrás
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleStatusUpdate("rejected")}
            disabled={isUpdating}
          >
            {isUpdating ? "Procesando..." : "Rechazar"}
          </Button>
          <Button
            variant="default"
            onClick={() => handleStatusUpdate("approved")}
            disabled={isUpdating}
          >
            {isUpdating ? "Procesando..." : "Aprobar"}
          </Button>
        </div>
      </div>
    </div>
  );
} 