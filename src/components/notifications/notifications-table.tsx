"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Check, 
  Trash2, 
  Mail,
  MailOpen,
  Filter,
  X
} from "lucide-react";
import { type ServiceNotificationWithDetails } from "@/lib/notifications/actions";
import { useMarkNotificationAsRead, useDeleteNotification } from "@/hooks/useNotifications";

interface NotificationsTableProps {
  notifications: ServiceNotificationWithDetails[];
  isLoading: boolean;
}

export function NotificationsTable({ notifications, isLoading }: NotificationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchMatch = 
        searchTerm === "" ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.technician.name.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = 
        statusFilter === "all" || 
        notification.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [notifications, searchTerm, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      unread: { variant: "default" as const, label: "No leída", icon: Mail },
      read: { variant: "secondary" as const, label: "Leída", icon: MailOpen },
      offered: { variant: "outline" as const, label: "Ofertada", icon: Eye },
      rejected: { variant: "destructive" as const, label: "Rechazada", icon: X },
    };

    const config = variants[status as keyof typeof variants] || variants.unread;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification.mutate(notificationId);
  };

  const toggleSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Controles de filtro y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título, contenido o destinatario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="unread">No leídas</SelectItem>
            <SelectItem value="read">Leídas</SelectItem>
            <SelectItem value="offered">Ofertadas</SelectItem>
            <SelectItem value="rejected">Rechazadas</SelectItem>
          </SelectContent>
        </Select>

        {selectedNotifications.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Aquí podrías implementar acciones en lote
              setSelectedNotifications(new Set());
            }}
          >
            {selectedNotifications.size} seleccionadas
          </Button>
        )}
      </div>

      {/* Información de resultados */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {filteredNotifications.length} de {notifications.length} notificaciones
        </span>
        {(searchTerm || statusFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla de notificaciones */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeletons de carga
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredNotifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {notifications.length === 0 
                    ? "No hay notificaciones disponibles"
                    : "No se encontraron notificaciones con los filtros aplicados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredNotifications.map((notification) => (
                <TableRow 
                  key={notification.id} 
                  className={`hover:bg-muted/50 ${
                    notification.status === "unread" ? "bg-blue-50/50" : ""
                  }`}
                >
                  {/* Checkbox de selección */}
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedNotifications.has(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    {getStatusBadge(notification.status)}
                  </TableCell>

                  {/* Título y contenido */}
                  <TableCell>
                    <div className="max-w-xs">
                      <div className={`font-medium ${
                        notification.status === "unread" ? "font-semibold" : ""
                      }`}>
                        {notification.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {notification.body}
                      </div>
                    </div>
                  </TableCell>

                  {/* Destinatario */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {notification.technician.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{notification.technician.name}</div>
                        <div className="text-sm text-muted-foreground">{notification.technician.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Servicio */}
                  <TableCell>
                    {notification.service ? (
                      <div>
                        <div className="font-medium">#{notification.service.id.slice(0, 8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {notification.service.category.name}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">General</Badge>
                    )}
                  </TableCell>

                  {/* Fecha */}
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(notification.created_at)}
                      {notification.read_at && (
                        <div className="text-xs text-muted-foreground">
                          Leída: {formatDate(notification.read_at)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {notification.status === "unread" && (
                          <>
                            <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Marcar como leída
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 