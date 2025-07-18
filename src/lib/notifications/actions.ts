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
  let targetUsers: string[] = [];

  // Determinar los usuarios objetivo según el tipo
  switch (bulkData.target_type) {
    case "all_technicians":
      const { data: allTechnicians, error: allTechError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "technician")
        .eq("status", "active");
      
      if (allTechError) throw new Error(allTechError.message);
      targetUsers = allTechnicians.map(t => t.id);
      break;

    case "technicians_by_category":
      if (!bulkData.target_ids?.length) throw new Error("Se requieren IDs de categoría");
      
      const { data: categoryTechnicians, error: catTechError } = await supabase
        .from("technician_work_info")
        .select("user_id")
        .contains("area_trabajo", bulkData.target_ids);
      
      if (catTechError) throw new Error(catTechError.message);
      targetUsers = categoryTechnicians.map(t => t.user_id);
      break;

    case "specific_technicians":
      if (!bulkData.target_ids?.length) throw new Error("Se requieren IDs de técnicos");
      targetUsers = bulkData.target_ids;
      break;

    case "all_clients":
      const { data: allClients, error: allClientError } = await supabase
        .from("users")
        .select("id")
        .eq("role", "client")
        .eq("status", "active");
      
      if (allClientError) throw new Error(allClientError.message);
      targetUsers = allClients.map(c => c.id);
      break;

    case "specific_clients":
      if (!bulkData.target_ids?.length) throw new Error("Se requieren IDs de clientes");
      targetUsers = bulkData.target_ids;
      break;

    default:
      throw new Error("Tipo de notificación no soportado");
  }

  if (targetUsers.length === 0) {
    throw new Error("No se encontraron usuarios para enviar la notificación");
  }

  // Enviar notificaciones usando la función send_notification para cada usuario
  const results: ServiceNotification[] = [];
  
  for (const userId of targetUsers) {
    try {
      // Usar la función send_notification que automáticamente envía push notifications
      const { error } = await supabase.rpc('send_notification', {
        p_user_id: userId,
        p_service_id: null, // Para notificaciones masivas generalmente no hay servicio específico
        p_status: 'unread',
        p_title: bulkData.title,
        p_body: bulkData.body,
        p_data: bulkData.data || {}
      });

      if (error) {
        console.error(`Error enviando notificación a usuario ${userId}:`, error);
        continue; // Continuar con el siguiente usuario
      }

      // Obtener la notificación creada
      const { data: notification, error: fetchError } = await supabase
        .from("service_notifications")
        .select()
        .eq("technician_id", userId)
        .eq("title", bulkData.title)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!fetchError && notification) {
        results.push(notification);
      }
    } catch (error) {
      console.error(`Error procesando usuario ${userId}:`, error);
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

// Nueva función para enviar push notifications directamente a la edge function
export async function sendPushNotificationsDirect(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: number; errors: string[] }> {
  try {
    // Obtener todos los tokens push de los usuarios
    const { data: pushTokensData, error: tokensError } = await supabase
      .from("push_tokens")
      .select("token")
      .in("user_id", userIds);

    if (tokensError) {
      throw new Error(`Error obteniendo tokens: ${tokensError.message}`);
    }

    const tokens = pushTokensData?.map(t => t.token).filter(Boolean) || [];
    
    if (tokens.length === 0) {
      console.warn("No se encontraron tokens push para los usuarios especificados");
      return { success: 0, errors: ["No hay tokens push disponibles"] };
    }

    // Llamar directamente a la edge function
    const response = await fetch('https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI'
      },
      body: JSON.stringify({
        tokens,
        message: {
          title,
          body,
          data: data || {}
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Error de edge function: ${result.error || 'Error desconocido'}`);
    }

    console.log('Push notifications enviadas exitosamente:', result);
    return { 
      success: result.tickets?.length || tokens.length, 
      errors: result.errors || [] 
    };

  } catch (error) {
    console.error('Error enviando push notifications directamente:', error);
    return { 
      success: 0, 
      errors: [error instanceof Error ? error.message : 'Error desconocido'] 
    };
  }
}

// Función mejorada para crear notificación en DB y enviar push notification
export async function createNotificationWithPush(
  userId: string,
  title: string,
  body: string,
  serviceId?: string,
  data?: Record<string, any>
): Promise<ServiceNotification> {
  try {
    // 1. Crear la notificación en la base de datos
    const { data: notification, error: dbError } = await supabase
      .from("service_notifications")
      .insert({
        service_id: serviceId || null,
        technician_id: userId,
        title,
        body,
        data: data || {},
        status: 'unread'
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Error creando notificación en DB: ${dbError.message}`);
    }

    // 2. Enviar push notification directamente
    const pushResult = await sendPushNotificationsDirect([userId], title, body, data);
    
    if (pushResult.success === 0 && pushResult.errors.length > 0) {
      console.warn('Push notification falló, pero notificación en DB creada:', pushResult.errors);
    }

    return notification;

  } catch (error) {
    console.error('Error en createNotificationWithPush:', error);
    throw error;
  }
}

// Función mejorada para enviar notificación manual desde el dashboard
export async function sendManualNotification(
  technicianId: string,
  title: string,
  body: string,
  serviceId?: string,
  data?: Record<string, any>
): Promise<ServiceNotification> {
  try {
    // Intentar primero con la función PostgreSQL existente
    const { error: rpcError } = await supabase.rpc('send_notification', {
      p_user_id: technicianId,
      p_service_id: serviceId || null,
      p_status: 'unread',
      p_title: title,
      p_body: body,
      p_data: data || { type: 'manual', source: 'dashboard' }
    });

    if (!rpcError) {
      // Si la función PostgreSQL funciona, obtener la notificación creada
      const { data: notification, error: fetchError } = await supabase
        .from("service_notifications")
        .select()
        .eq("technician_id", technicianId)
        .eq("title", title)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!fetchError) {
        return notification;
      }
    }

    // Si la función PostgreSQL falla, usar el método directo
    console.warn('Función PostgreSQL falló, usando método directo:', rpcError?.message);
    return await createNotificationWithPush(
      technicianId,
      title,
      body,
      serviceId,
      { ...data, type: 'manual', source: 'dashboard', fallback: true }
    );

  } catch (error) {
    console.error('Error en sendManualNotification:', error);
    throw error;
  }
}

// Función mejorada para enviar notificación manual a cliente
export async function sendManualNotificationToClient(
  clientId: string,
  title: string,
  body: string,
  serviceId?: string,
  data?: Record<string, any>
): Promise<ServiceNotification> {
  try {
    // Intentar primero con la función PostgreSQL existente
    const { error: rpcError } = await supabase.rpc('send_notification', {
      p_user_id: clientId,
      p_service_id: serviceId || null,
      p_status: 'unread',
      p_title: title,
      p_body: body,
      p_data: data || { type: 'manual', source: 'dashboard' }
    });

    if (!rpcError) {
      // Si la función PostgreSQL funciona, obtener la notificación creada
      const { data: notification, error: fetchError } = await supabase
        .from("service_notifications")
        .select()
        .eq("technician_id", clientId)
        .eq("title", title)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!fetchError) {
        return notification;
      }
    }

    // Si la función PostgreSQL falla, usar el método directo
    console.warn('Función PostgreSQL falló para cliente, usando método directo:', rpcError?.message);
    return await createNotificationWithPush(
      clientId,
      title,
      body,
      serviceId,
      { ...data, type: 'manual', source: 'dashboard', fallback: true }
    );

  } catch (error) {
    console.error('Error en sendManualNotificationToClient:', error);
    throw error;
  }
}

// Función mejorada para envío masivo manual desde el dashboard
export async function sendBulkManualNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: ServiceNotification[], errors: string[] }> {
  const results: ServiceNotification[] = [];
  const errors: string[] = [];

  // Intentar envío masivo optimizado primero
  try {
    // 1. Crear todas las notificaciones en la DB de una vez
    const notificationsToInsert = userIds.map(userId => ({
      service_id: null,
      technician_id: userId,
      title,
      body,
      data: { ...data, type: 'bulk_manual', source: 'dashboard' },
      status: 'unread' as const
    }));

    const { data: notifications, error: bulkInsertError } = await supabase
      .from("service_notifications")
      .insert(notificationsToInsert)
      .select();

    if (bulkInsertError) {
      throw new Error(`Error en inserción masiva: ${bulkInsertError.message}`);
    }

    if (notifications) {
      results.push(...notifications);
    }

    // 2. Enviar push notifications masivas
    const pushResult = await sendPushNotificationsDirect(userIds, title, body, data);
    
    if (pushResult.errors.length > 0) {
      errors.push(...pushResult.errors.map(err => `Push notification: ${err}`));
    }

    console.log(`Envío masivo completado: ${results.length} notificaciones DB, ${pushResult.success} push notifications`);

  } catch (error) {
    console.error('Error en envío masivo optimizado, usando método individual:', error);
    
    // Fallback: envío individual
    for (const userId of userIds) {
      try {
        const notification = await sendManualNotification(
          userId,
          title,
          body,
          undefined,
          { ...data, type: 'bulk_manual', source: 'dashboard', individual_fallback: true }
        );
        results.push(notification);
      } catch (individualError) {
        const errorMessage = `Error enviando a usuario ${userId}: ${individualError instanceof Error ? individualError.message : 'Error desconocido'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }
  }

  return { success: results, errors };
}

// Función mejorada para verificar el estado de las notificaciones push
export async function testPushNotificationConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpemdqaHlwbnVhYWR1YWZ0YWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAyMzU3NTcsImV4cCI6MjA0NTgxMTc1N30.fo1rbcV4XPpcWBB3GzCnxsBEmp-eQikt-sk3Zn7g6PI'
      },
      body: JSON.stringify({
        tokens: ['ExponentPushToken[test-token-invalid]'], // Token de prueba válido en formato
        message: {
          title: 'Test Connection',
          body: 'Verificando conexión con edge function',
          data: { test: true, timestamp: new Date().toISOString() }
        }
      })
    });

    const result = await response.json();
    
    // La edge function está funcionando si no devuelve error 500
    // Error 400 es esperado por token inválido, pero significa que la función responde
    const isWorking = response.status !== 500;
    
    console.log('Test push notification result:', {
      status: response.status,
      isWorking,
      result
    });
    
    return isWorking;
    
  } catch (error) {
    console.error('Error testing push notification connection:', error);
    return false;
  }
} 