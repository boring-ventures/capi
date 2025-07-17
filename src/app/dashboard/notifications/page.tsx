"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Send, Bell, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificationsTable } from "@/components/notifications/notifications-table";
import { SendNotificationModal } from "@/components/notifications/send-notification-modal";
import { useNotifications, useNotificationStats } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsError, refetch } = useNotifications();
  const { data: stats, isLoading: statsLoading } = useNotificationStats();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y envía notificaciones a usuarios del sistema
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={notificationsLoading}>
            <Bell className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Button onClick={() => setIsSendModalOpen(true)} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviar Notificación
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notificaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">No Leídas</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enviadas Hoy</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Send className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs de Contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="history">Historial Completo</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notificaciones Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones Recientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                        <div className={`h-2 w-2 mt-2 rounded-full ${
                          notification.status === "unread" ? "bg-blue-500" : "bg-gray-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <Badge variant={notification.status === "unread" ? "default" : "secondary"} className="ml-2">
                              {notification.status === "unread" ? "No leída" : "Leída"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{notification.body}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{notification.technician.name}</span>
                            <span className="mx-1">•</span>
                            <span>{formatDate(notification.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setActiveTab("history")}
                      >
                        Ver todas las notificaciones ({notifications.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p>No hay notificaciones recientes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estadísticas Detalladas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Estadísticas del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : stats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de notificaciones</span>
                      <Badge variant="outline">{stats.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">No leídas</span>
                      <Badge variant="destructive">{stats.unread}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Leídas</span>
                      <Badge variant="default">{stats.read}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Este mes</span>
                      <Badge variant="secondary">{stats.thisMonth}</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Tasa de lectura</span>
                        <span className="text-sm font-bold text-green-600">
                          {stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Historial Completo */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              {notificationsError ? (
                <Alert>
                  <AlertDescription>
                    Error al cargar las notificaciones. Por favor, intenta nuevamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <NotificationsTable 
                  notifications={notifications}
                  isLoading={notificationsLoading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-gray-300" />
                <p className="text-gray-500">
                  Las opciones de configuración se implementarán próximamente
                </p>
                <p className="text-sm text-gray-400">
                  Aquí podrás configurar templates, horarios de envío y preferencias del sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Envío de Notificaciones */}
      <SendNotificationModal
        open={isSendModalOpen}
        onOpenChange={setIsSendModalOpen}
      />
    </div>
  );
} 