import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, X } from "lucide-react";
import { CategorySelector } from "./category-selector";

interface Category {
  id: string;
  name: string;
  image_url?: string;
  technician_count?: number;
}

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  reviewStatusFilter: string;
  setReviewStatusFilter: (value: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (value: string[]) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  categories: Category[];
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  reviewStatusFilter,
  setReviewStatusFilter,
  selectedCategories,
  setSelectedCategories,
  dateFilter,
  setDateFilter,
  categories,
  activeFiltersCount,
  onClearFilters,
}: UserFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Filtros principales */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            if (value !== "technician") {
              setSelectedCategories([]);
              setReviewStatusFilter("todos");
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos los roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los roles</SelectItem>
            <SelectItem value="technician">Técnicos</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="this-week">Esta semana</SelectItem>
            <SelectItem value="this-month">Este mes</SelectItem>
            <SelectItem value="last-month">Mes pasado</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpiar
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Tabs contextuales para técnicos */}
      {roleFilter === "technician" && (
        <div className="space-y-3">
          <Tabs value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="approved">Aprobados</TabsTrigger>
              <TabsTrigger value="accepted">Aceptados</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            </TabsList>
          </Tabs>

          <CategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </div>
      )}
    </div>
  );
} 