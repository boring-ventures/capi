import { supabase } from "@/utils/supabaseClient";

export type NotificationStatus = "unread" | "read" | "offered" | "rejected";

export interface ServiceNotification {
  id: string;
  service_id: string;
  technician_id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  status: NotificationStatus;
  created_at: string;
  read_at?: string;
}

export interface ServiceNotificationWithDetails extends ServiceNotification {
  service: {
    id: string;
    status: string;
    category: {
      name: string;
    };
    client: {
      name: string;
    };
  };
  technician: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateNotificationData {
  service_id?: string;
  technician_id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface BulkNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  target_type: "all_technicians" | "technicians_by_category" | "specific_technicians" | "all_clients" | "specific_clients";
  target_ids?: string[]; // IDs específicos de usuarios o categorías
}

// Obtener todas las notificaciones con detalles
export async function getNotifications(): Promise<ServiceNotificationWithDetails[]> {
  const { data, error } = await supabase
    .from("service_notifications")
    .select(`
      *,
      service:services(
        id,
        status,
        category:categories(name),
        client:users!client_id(name)
      ),
      technician:users!technician_id(id, name, email)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// Obtener notificaciones por técnico
export async function getNotificationsByTechnician(technicianId: string): Promise<ServiceNotificationWithDetails[]> {
  const { data, error } = await supabase
    .from("service_notifications")
    .select(`
      *,
      service:services(
        id,
        status,
        category:categories(name),
        client:users!client_id(name)
      ),
      technician:users!technician_id(id, name, email)
    `)
    .eq("technician_id", technicianId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// Crear una notificación individual usando la función PostgreSQL
export async function createNotification(notificationData: CreateNotificationData): Promise<ServiceNotification> {
  // Usar la función send_notification que ya existe en la base de datos
  const { data, error } = await supabase.rpc('send_notification', {
    p_user_id: notificationData.technician_id,
    p_service_id: notificationData.service_id || null,
    p_status: 'unread',
    p_title: notificationData.title,
    p_body: notificationData.body,
    p_data: notificationData.data || {}
  });

  if (error) throw new Error(error.message);

  // Obtener la notificación creada
  const { data: notification, error: fetchError } = await supabase
    .from("service_notifications")
    .select()
    .eq("technician_id", notificationData.technician_id)
    .eq("title", notificationData.title)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return notification;
}

// Crear notificaciones en masa usando la función PostgreSQL
export async function createBulkNotifications(bulkData: BulkNotificationData): Promise<ServiceNotification[]> {
  let targetTechnicians: string[] = [];

  // Determinar los técnicos objetivo según el tipo
  switch (bulkData.target_type) {
    case "all_technicians":
      const { data: allTechnicians, error: allTechError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "technician")
        .eq("status", "active");
      
      if (allTechError) throw new Error(allTechError.message);
      targetTechnicians = allTechnicians.map(t => t.id);
      break;

    case "technicians_by_category":
      if (!bulkData.target_ids?.length) throw new Error("Se requieren IDs de categoría");
      
      const { data: categoryTechnicians, error: catTechError } = await supabase
        .from("technician_work_info")
        .select("user_id")
        .contains("area_trabajo", bulkData.target_ids);
      
      if (catTechError) throw new Error(catTechError.message);
      targetTechnicians = categoryTechnicians.map(t => t.user_id);
      break;

    case "specific_technicians":
      if (!bulkData.target_ids?.length) throw new Error("Se requieren IDs de técnicos");
      targetTechnicians = bulkData.target_ids;
      break;

    default:
      throw new Error("Tipo de notificación no soportado");
  }

  if (targetTechnicians.length === 0) {
    throw new Error("No se encontraron técnicos para enviar la notificación");
  }

  // Enviar notificaciones usando la función send_notification para cada técnico
  const results: ServiceNotification[] = [];
  
  for (const technicianId of targetTechnicians) {
    try {
      // Usar la función send_notification que automáticamente envía push notifications
      const { error } = await supabase.rpc('send_notification', {
        p_user_id: technicianId,
        p_service_id: null, // Para notificaciones masivas generalmente no hay servicio específico
        p_status: 'unread',
        p_title: bulkData.title,
        p_body: bulkData.body,
        p_data: bulkData.data || {}
      });

      if (error) {
        console.error(`Error enviando notificación a técnico ${technicianId}:`, error);
        continue; // Continuar con el siguiente técnico
      }

      // Obtener la notificación creada
      const { data: notification, error: fetchError } = await supabase
        .from("service_notifications")
        .select()
        .eq("technician_id", technicianId)
        .eq("title", bulkData.title)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!fetchError && notification) {
        results.push(notification);
      }
    } catch (error) {
      console.error(`Error procesando técnico ${technicianId}:`, error);
    }
  }

  return results;
}

// Marcar notificación como leída
export async function markNotificationAsRead(notificationId: string): Promise<ServiceNotification> {
  const { data, error } = await supabase
    .from("service_notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString()
    })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// Marcar múltiples notificaciones como leídas
export async function markMultipleNotificationsAsRead(notificationIds: string[]): Promise<void> {
  const { error } = await supabase
    .from("service_notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString()
    })
    .in("id", notificationIds);

  if (error) throw new Error(error.message);
}

// Eliminar notificación
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("service_notifications")
    .delete()
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
}

// Obtener estadísticas de notificaciones
export async function getNotificationStats() {
  const { data: notifications, error } = await supabase
    .from("service_notifications")
    .select("status, created_at");

  if (error) throw new Error(error.message);

  const today = new Date();
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => n.status === "unread").length,
    read: notifications.filter(n => n.status === "read").length,
    today: notifications.filter(n => 
      new Date(n.created_at).toDateString() === today.toDateString()
    ).length,
    thisWeek: notifications.filter(n => 
      new Date(n.created_at) >= thisWeek
    ).length,
    thisMonth: notifications.filter(n => 
      new Date(n.created_at) >= thisMonth
    ).length,
  };

  return stats;
}

// Obtener tokens push por usuario
export async function getPushTokensByUser(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data.map(t => t.token);
}

// Guardar token push
export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from("push_tokens")
    .upsert({
      user_id: userId,
      token: token,
      updated_at: new Date().toISOString()
    });

  if (error) throw new Error(error.message);
}

// Función para enviar notificación manual desde el dashboard (con push notification automática)
export async function sendManualNotification(
  technicianId: string,
  title: string,
  body: string,
  serviceId?: string,
  data?: Record<string, any>
): Promise<ServiceNotification> {
  // Usar la función send_notification que automáticamente maneja push notifications
  const { error } = await supabase.rpc('send_notification', {
    p_user_id: technicianId,
    p_service_id: serviceId || null,
    p_status: 'unread',
    p_title: title,
    p_body: body,
    p_data: data || { type: 'manual', source: 'dashboard' }
  });

  if (error) throw new Error(error.message);

  // Obtener la notificación creada
  const { data: notification, error: fetchError } = await supabase
    .from("service_notifications")
    .select()
    .eq("technician_id", technicianId)
    .eq("title", title)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  return notification;
}

// Función para envío masivo manual desde el dashboard
export async function sendBulkManualNotifications(
  technicianIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: ServiceNotification[], errors: string[] }> {
  const results: ServiceNotification[] = [];
  const errors: string[] = [];

  for (const technicianId of technicianIds) {
    try {
      const notification = await sendManualNotification(
        technicianId,
        title,
        body,
        undefined,
        { ...data, type: 'bulk_manual', source: 'dashboard' }
      );
      results.push(notification);
    } catch (error) {
      const errorMessage = `Error enviando a técnico ${technicianId}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  return { success: results, errors };
}

// Función para verificar el estado de las notificaciones push
export async function testPushNotificationConnection(): Promise<boolean> {
  try {
    // Hacer una llamada de prueba a la edge function
    const response = await fetch('https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokens: ['test-token'], // Token de prueba
        message: {
          title: 'Test',
          body: 'Test connection',
          data: { test: true }
        }
      })
    });

    // Si no es un error 400 (que esperamos por el token inválido), la conexión funciona
    return response.status !== 500;
  } catch (error) {
    console.error('Error testing push notification connection:', error);
    return false;
  }
} 