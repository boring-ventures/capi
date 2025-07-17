"use client";

import { Search, Filter, X, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ServiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  technicianFilter: string;
  setTechnicianFilter: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  activeFiltersCount: number;
  clearFilters: () => void;
  categories?: Array<{ id: string; name: string }>;
  technicians?: Array<{ id: string; name: string }>;
}

export function ServiceFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  technicianFilter,
  setTechnicianFilter,
  priceRange,
  setPriceRange,
  dateFilter,
  setDateFilter,
  activeFiltersCount,
  clearFilters,
  categories = [],
  technicians = [],
}: ServiceFiltersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID, cliente, técnico, categoría o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Filtros Avanzados
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-8 px-2"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filtro por Estado */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Estado</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="created">Creado</SelectItem>
                        <SelectItem value="in_progress">En Progreso</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                        <SelectItem value="disputed">En Disputa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Categoría */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Categoría</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las categorías</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Técnico */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Técnico</Label>
                    <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los técnicos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los técnicos</SelectItem>
                        <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                        {technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.id}>
                            {technician.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por Rango de Precio */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-gray-600">
                      Rango de Precio: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={0}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  {/* Filtro por Fecha */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Fecha</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las fechas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas las fechas</SelectItem>
                        <SelectItem value="hoy">Hoy</SelectItem>
                        <SelectItem value="esta_semana">Esta semana</SelectItem>
                        <SelectItem value="este_mes">Este mes</SelectItem>
                        <SelectItem value="ultimo_mes">Último mes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "todos" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("todos")}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === "created" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("created")}
        >
          Creados
        </Button>
        <Button
          variant={statusFilter === "in_progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("in_progress")}
        >
          En Progreso
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("completed")}
        >
          Completados
        </Button>
        <Button
          variant={statusFilter === "disputed" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("disputed")}
        >
          Disputas
        </Button>
      </div>

      {/* Mostrar filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-900">Filtros activos:</span>
          
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Búsqueda: "{searchTerm}"
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            </Badge>
          )}
          
          {statusFilter !== "todos" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Estado: {statusFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setStatusFilter("todos")}
              />
            </Badge>
          )}
          
          {categoryFilter !== "todas" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Categoría: {categories.find(c => c.id === categoryFilter)?.name || categoryFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setCategoryFilter("todas")}
              />
            </Badge>
          )}
          
          {technicianFilter !== "todos" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Técnico: {technicianFilter === "sin_asignar" ? "Sin asignar" : 
                       technicians.find(t => t.id === technicianFilter)?.name || technicianFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setTechnicianFilter("todos")}
              />
            </Badge>
          )}
          
          {dateFilter !== "todos" && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Fecha: {dateFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setDateFilter("todos")}
              />
            </Badge>
          )}

          {(priceRange[0] > 0 || priceRange[1] < 10000) && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Precio: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setPriceRange([0, 10000])}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 