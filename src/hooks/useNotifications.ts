import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getNotificationsByTechnician,
  createNotification,
  createBulkNotifications,
  sendManualNotification,
  sendManualNotificationToClient,
  sendBulkManualNotifications,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  testPushNotificationConnection,
  type CreateNotificationData,
  type BulkNotificationData,
} from "@/lib/notifications/actions";
import { toast } from "sonner";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};

export const useNotificationsByTechnician = (technicianId: string) => {
  return useQuery({
    queryKey: ["notifications", "technician", technicianId],
    queryFn: () => getNotificationsByTechnician(technicianId),
    enabled: !!technicianId,
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: getNotificationStats,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationData: CreateNotificationData) =>
      createNotification(notificationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("Notificación enviada exitosamente");
    },
    onError: (error: Error) => {
      console.error("Error creating notification:", error);
      toast.error("Error al enviar la notificación");
    },
  });
};

export const useCreateBulkNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData: BulkNotificationData) =>
      createBulkNotifications(bulkData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success(`${data.length} notificaciones enviadas exitosamente`);
    },
    onError: (error: Error) => {
      console.error("Error creating bulk notifications:", error);
      toast.error("Error al enviar las notificaciones masivas");
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },
    onError: (error: Error) => {
      console.error("Error marking notification as read:", error);
      toast.error("Error al marcar la notificación como leída");
    },
  });
};

export const useMarkMultipleNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      markMultipleNotificationsAsRead(notificationIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success(`${variables.length} notificaciones marcadas como leídas`);
    },
    onError: (error: Error) => {
      console.error("Error marking notifications as read:", error);
      toast.error("Error al marcar las notificaciones como leídas");
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      toast.success("Notificación eliminada exitosamente");
    },
    onError: (error: Error) => {
      console.error("Error deleting notification:", error);
      toast.error("Error al eliminar la notificación");
    },
  });
};

// Hook para enviar notificación manual (dashboard)
export const useSendManualNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      technicianId,
      title,
      body,
      serviceId,
      data,
    }: {
      technicianId: string;
      title: string;
      body: string;
      serviceId?: string;
      data?: Record<string, any>;
    }) => sendManualNotification(technicianId, title, body, serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      
      // Verificar si se usó fallback
      const usedFallback = variables.data?.fallback;
      if (usedFallback) {
        toast.success("Notificación enviada (método directo) ✅");
      } else {
        toast.success("Notificación enviada exitosamente ✅");
      }
    },
    onError: (error: Error) => {
      console.error("Error sending manual notification:", error);
      toast.error(`Error al enviar notificación: ${error.message}`);
    },
  });
};

// Hook para enviar notificación manual a cliente (dashboard)
export const useSendManualNotificationToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      title,
      body,
      serviceId,
      data,
    }: {
      clientId: string;
      title: string;
      body: string;
      serviceId?: string;
      data?: Record<string, any>;
    }) => sendManualNotificationToClient(clientId, title, body, serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      
      // Verificar si se usó fallback
      const usedFallback = variables.data?.fallback;
      if (usedFallback) {
        toast.success("Notificación al cliente enviada (método directo) ✅");
      } else {
        toast.success("Notificación al cliente enviada exitosamente ✅");
      }
    },
    onError: (error: Error) => {
      console.error("Error sending manual notification to client:", error);
      toast.error(`Error al enviar notificación al cliente: ${error.message}`);
    },
  });
};

// Hook para envío masivo manual (dashboard)
export const useSendBulkManualNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userIds,
      title,
      body,
      data,
    }: {
      userIds: string[];
      title: string;
      body: string;
      data?: Record<string, any>;
    }) => sendBulkManualNotifications(userIds, title, body, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
      
      const { success, errors } = result;
      
      if (success.length > 0 && errors.length === 0) {
        toast.success(`🎉 ${success.length} notificaciones enviadas exitosamente`);
      } else if (success.length > 0 && errors.length > 0) {
        toast.success(`✅ ${success.length} enviadas, ⚠️ ${errors.length} fallaron`);
        console.warn("Errores en envío masivo:", errors);
      } else if (errors.length > 0) {
        toast.error(`❌ Todas las notificaciones fallaron (${errors.length})`);
        console.error("Errores en envío masivo:", errors);
      }
    },
    onError: (error: Error) => {
      console.error("Error sending bulk manual notifications:", error);
      toast.error(`Error al enviar notificaciones: ${error.message}`);
    },
  });
};

// Hook mejorado para verificar conexión de push notifications
export const useTestPushNotificationConnection = () => {
  return useQuery({
    queryKey: ["push-notification-test"],
    queryFn: testPushNotificationConnection,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}; 