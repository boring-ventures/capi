"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  BarChart3, 
  FileDown, 
  Plus,
  TrendingUp,
  Users,
  Clock,
  Star,
  DollarSign,
  Calendar
} from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useAdvancedServiceFilters } from "@/hooks/useAdvancedServiceFilters";

interface AdvancedServiceHeaderProps {
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AdvancedServiceHeader({
  isLoading = false,
  onRefresh,
}: AdvancedServiceHeaderProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const { data: services = [] } = useServices();
  const { stats, filteredServices } = useAdvancedServiceFilters({ services });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
          {isLoading ? (
            <div className="text-gray-600 mt-1">
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <p className="text-gray-600 mt-1">
              Mostrando {filteredServices.length} servicios de {services.length} totales
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showAnalytics ? "Ocultar" : "Mostrar"} Análisis
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>

          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Servicios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Calendar className="h-3 w-3" />
              Hoy: {stats.todayServices}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{stats.in_progress}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.in_progress / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completados</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Promedio: {formatCurrency(stats.averagePrice)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panel de Estados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Estado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              Creados: {stats.created}
            </Badge>
            <Badge variant="default" className="flex items-center gap-2 px-3 py-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              En Progreso: {stats.in_progress}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Completados: {stats.completed}
            </Badge>
            <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              Cancelados: {stats.canceled}
            </Badge>
            {stats.disputed > 0 && (
              <Badge variant="destructive" className="flex items-center gap-2 px-3 py-1">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                Disputados: {stats.disputed}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Panel de Análisis Avanzado (Opcional) */}
      {showAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Análisis Detallado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorías Populares */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Categorías más Solicitadas</h4>
                <div className="space-y-2">
                  {Object.entries(stats.categories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{category}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </div>

              {/* Métricas de Rendimiento */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Métricas de Rendimiento</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de Completado</span>
                    <span className="font-medium">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de Cancelación</span>
                    <span className="font-medium text-red-600">
                      {stats.total > 0 ? Math.round((stats.canceled / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  {stats.disputed > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Servicios Disputados</span>
                      <span className="font-medium text-red-600">
                        {stats.total > 0 ? Math.round((stats.disputed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 