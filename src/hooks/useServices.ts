import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServices,
  getServiceById,
  updateServiceStatus,
  assignTechnician,
  type ServiceStatus,
} from "@/lib/services/actions";
import { toast } from "sonner";

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: getServices,
  });
};

export const useService = (serviceId: string) => {
  return useQuery({
    queryKey: ["services", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId,
  });
};

export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceStatus }) =>
      updateServiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Estado del servicio actualizado exitosamente");
    },
    onError: (error) => {
      console.error("Error updating service status:", error);
      toast.error("Error al actualizar el estado del servicio");
    },
  });
};

export const useAssignTechnician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, technicianId }: { serviceId: string; technicianId: string }) =>
      assignTechnician(serviceId, technicianId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Técnico asignado exitosamente");
    },
    onError: (error) => {
      console.error("Error assigning technician:", error);
      toast.error("Error al asignar el técnico");
    },
  });
}; 