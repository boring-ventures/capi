# Sistema de Notificaciones CAPI

## 📋 Resumen

Sistema completo de notificaciones que combina notificaciones en app y push notifications automáticas usando Supabase y Expo.

## 🏗️ Arquitectura

### Frontend (React/Next.js)
- **Dashboard Manual**: `/dashboard/notifications` - Interfaz para envío manual
- **Componentes**: Modal de envío, tabla de notificaciones, filtros avanzados
- **Hooks**: React Query para gestión de estado y llamadas API

### Backend (Supabase)
- **Función PostgreSQL**: `send_notification()` - Maneja DB + push automático
- **Edge Function**: `send-push-notifications` - Servicio Expo para push notifications
- **Triggers**: Automáticos para nuevos servicios y ofertas

## 🔧 Funcionalidades

### ✅ Notificaciones Manuales (Dashboard)
```typescript
// Notificación individual
await sendManualNotification(technicianId, title, body, serviceId?, data?)

// Notificación masiva
await sendBulkManualNotifications(technicianIds[], title, body, data?)
```

### ✅ Notificaciones Automáticas (Triggers)
- **Nuevo servicio**: Notifica a técnicos de la categoría
- **Nueva oferta**: Notifica al cliente
- **Cambio de estado**: Notifica según el estado

### ✅ Gestión Completa
- Marcar como leída/no leída
- Eliminar notificaciones
- Filtros avanzados (estado, fecha, técnico)
- Estadísticas en tiempo real
- Paginación y búsqueda

## 🚀 Cómo Usar

### 1. Desde el Dashboard
1. Ir a `/dashboard/notifications`
2. Clic en "Enviar Notificación"
3. Elegir individual o masiva
4. Completar formulario
5. Enviar → Se crea en DB + push automático

### 2. Triggers Automáticos
Los triggers ya están configurados para:
- Nuevos servicios → Técnicos relevantes
- Ofertas → Clientes
- Cambios de estado → Usuario correspondiente

### 3. Push Notifications
- **Automático**: Función `send_notification()` maneja todo
- **Tokens**: Gestión en tabla `push_tokens`
- **Expo**: Edge function maneja envío masivo

## 📊 Estado del Sistema

### ✅ Implementado Completamente
- ✅ Dashboard de notificaciones
- ✅ Envío manual individual y masivo
- ✅ Tabla con filtros y búsqueda
- ✅ Integración con función PostgreSQL existente
- ✅ Push notifications automáticas
- ✅ Gestión de errores y estados de carga
- ✅ Estadísticas en tiempo real

### 🔧 Configuración Requerida
Para que funcione al 100%, asegurar que en Supabase:

1. **Función `send_notification` existe** ✅ (proporcionada)
2. **Edge function desplegada** ✅ (proporcionada)
3. **Triggers instalados** ✅ (proporcionados)

## 🔌 Integración con Función Existente

### Función PostgreSQL: `send_notification`
```sql
-- Parámetros
p_user_id: uuid          -- ID del técnico
p_service_id: uuid       -- ID del servicio (opcional)
p_status: notification_status -- Estado de la notificación  
p_title: text           -- Título
p_body: text           -- Mensaje
p_data: jsonb          -- Datos adicionales

-- Funcionalidad
1. Inserta en service_notifications
2. Obtiene push_tokens del usuario
3. Llama a edge function para envío push
4. Maneja errores automáticamente
```

### Edge Function: `send-push-notifications`
```typescript
// URL: https://lizgjhypnuaaduaftafp.supabase.co/functions/v1/send-push-notifications
// Payload:
{
  tokens: string[],        // Tokens Expo
  message: {
    title: string,
    body: string,
    data: object
  }
}

// Funcionalidad:
- Valida tokens Expo
- Chunking para lotes
- Envío optimizado
- Manejo de errores
```

## 📱 Flujo Completo

### Notificación Manual
1. **Usuario** → Dashboard → Enviar notificación
2. **Frontend** → `useSendManualNotification()`
3. **Supabase** → `send_notification()` function
4. **PostgreSQL** → Inserta en DB + obtiene tokens
5. **Edge Function** → Envía push notifications
6. **Expo** → Entrega a dispositivos
7. **Frontend** → Actualiza UI

### Notificación Automática  
1. **Sistema** → Nuevo servicio creado
2. **Trigger** → `notify_technicians_for_service()`
3. **PostgreSQL** → Bulk insert + obtiene tokens
4. **Edge Function** → Envío masivo push
5. **Dispositivos** → Reciben notificaciones

## 🛠️ Desarrollo

### Archivos Clave
```
src/
├── lib/notifications/
│   ├── actions.ts           # Funciones CRUD + integración
│   └── README.md           # Esta documentación
├── hooks/
│   └── useNotifications.ts  # React Query hooks
├── components/notifications/
│   ├── send-notification-modal.tsx    # Modal envío
│   ├── notifications-table.tsx       # Tabla con filtros
│   └── notification-stats-card.tsx   # Estadísticas
└── app/dashboard/notifications/
    └── page.tsx            # Página principal
```

### Comandos Útiles
```bash
# Desarrollo
npm run dev

# Verificar tipos
npm run lint

# Build
npm run build
```

## 🔍 Testing

### Verificar Push Notifications
La función `testPushNotificationConnection()` verifica que la edge function esté respondiendo correctamente.

### Debug
- Logs en consola del navegador
- Logs de PostgreSQL en Supabase
- Monitor de edge functions en Supabase

## 📈 Métricas

El dashboard incluye:
- Total de notificaciones
- No leídas vs leídas  
- Enviadas hoy/semana/mes
- Tasa de lectura
- Estado de conexión push

## 🎯 Próximos Pasos

El sistema está **100% funcional**. Posibles mejoras futuras:
- Templates de notificaciones
- Programación de envíos
- Analíticas avanzadas
- Segmentación por ubicación

---

**Sistema creado con amor 💙 para CAPI** 