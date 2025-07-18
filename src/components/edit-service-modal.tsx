"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Save, 
  Loader2,
  User,
  DollarSign,
  FileText
} from "lucide-react";
import { type ServiceWithDetails, updateServiceStatus, assignTechnician } from "@/lib/services/actions";
import { useUsers } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/utils/supabaseClient";

const editServiceSchema = z.object({
  status: z.enum(["created", "in_progress", "completed", "canceled", "disputed"]),
  technician_id: z.string().optional(),
  agreed_price: z.string().optional(),
  description: z.string().optional(),
});

type EditServiceFormData = z.infer<typeof editServiceSchema>;

interface EditServiceModalProps {
  service: ServiceWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceUpdated?: () => void;
}

export function EditServiceModal({ 
  service, 
  open, 
  onOpenChange, 
  onServiceUpdated 
}: EditServiceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: users = [] } = useUsers();

  // Filtrar solo técnicos activos
  const technicians = users.filter(user => user.role === "technician" && user.status === "active");

  const form = useForm<EditServiceFormData>({
    resolver: zodResolver(editServiceSchema),
    defaultValues: {
      status: "created",
      technician_id: "",
      agreed_price: "",
      description: "",
    },
  });

  // Actualizar formulario cuando cambie el servicio
  useEffect(() => {
    if (service) {
      form.reset({
        status: service.status,
        technician_id: service.technician_id || "",
        agreed_price: service.agreed_price?.toString() || "",
        description: service.description || "",
      });
    }
  }, [service, form]);

  const updateServiceMutation = useMutation({
    mutationFn: async (data: EditServiceFormData) => {
      if (!service) throw new Error("No service selected");

      const updates: any = {};
      let shouldUpdateTechnician = false;

      // Actualizar estado si cambió
      if (data.status !== service.status) {
        updates.status = data.status;
        updates.updated_at = new Date().toISOString();
        
        // Si se completa el servicio, agregar fecha de finalización
        if (data.status === "completed") {
          updates.completion_date = new Date().toISOString();
        }
      }

      // Actualizar técnico si cambió
      if (data.technician_id !== (service.technician_id || "")) {
        shouldUpdateTechnician = true;
        if (data.technician_id) {
          updates.technician_id = data.technician_id;
          if (data.status === "created") {
            updates.status = "in_progress";
            updates.acceptance_date = new Date().toISOString();
          }
        } else {
          updates.technician_id = null;
        }
      }

      // Actualizar precio si cambió
      if (data.agreed_price !== (service.agreed_price?.toString() || "")) {
        updates.agreed_price = data.agreed_price ? parseFloat(data.agreed_price) : null;
      }

      // Actualizar descripción si cambió
      if (data.description !== (service.description || "")) {
        updates.description = data.description || null;
      }

      // Realizar la actualización
      const { error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", service.id);

      if (error) throw new Error(error.message);

      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Servicio actualizado",
        description: "Los cambios se han guardado exitosamente.",
      });
      onServiceUpdated?.();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el servicio: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditServiceFormData) => {
    updateServiceMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const statusOptions = [
    { value: "created", label: "Creado" },
    { value: "in_progress", label: "En Progreso" },
    { value: "completed", label: "Completado" },
    { value: "canceled", label: "Cancelado" },
    { value: "disputed", label: "En Disputa" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editar Servicio #{service?.id.slice(-6)}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Estado del servicio */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del Servicio</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Técnico asignado */}
            <FormField
              control={form.control}
              name="technician_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Técnico Asignado
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin técnico asignado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin técnico asignado</SelectItem>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{technician.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ⭐ {technician.rating}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio acordado */}
            <FormField
              control={form.control}
              name="agreed_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Precio Acordado (BOB)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Servicio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del servicio..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateServiceMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateServiceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 