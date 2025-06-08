"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "./user-avatar";
import { UserStatus } from "./user-status";
import { UserRating } from "./user-rating";
import { UserActions } from "./user-actions";
import { useUsers, useCategories } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "technician" | "client";
  status: "active" | "inactive";
  reviewStatus: "pending" | "rejected" | "approved" | "accepted";
  rating?: number;
  password: string;
  categories?: string[];
  categoryIds?: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface UsersTableProps {
  onDataChange?: (users: User[], filters: any) => void;
}

export function UsersTable({ onDataChange }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const { data: users = [], isLoading, error } = useUsers();
  const { data: categories = [] } = useCategories();
  const router = useRouter();
  const lastDataRef = useRef<{users: any[], filters: any}>();

  const filteredUsers = users.filter(
    (user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === "todos" || user.role === roleFilter;
      const matchesStatus = statusFilter === "todos" || user.status === statusFilter;
      
      let matchesCategory = true;
      if (categoryFilter !== "todas" && roleFilter === "technician") {
        const selectedCategory = categories.find(cat => cat.name === categoryFilter);
        if (selectedCategory && user.categoryIds) {
          matchesCategory = user.categoryIds.includes(selectedCategory.id);
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesCategory;
    }
  );

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onDataChange) {
      const filters = {
        searchTerm,
        roleFilter,
        statusFilter,
        categoryFilter
      };
      
      // Evitar llamadas innecesarias comparando con la última data enviada
      const currentData = { users: filteredUsers, filters };
      const lastData = lastDataRef.current;
      
      if (!lastData || 
          JSON.stringify(currentData.filters) !== JSON.stringify(lastData.filters) ||
          currentData.users.length !== lastData.users.length) {
        onDataChange(filteredUsers, filters);
        lastDataRef.current = currentData;
      }
    }
  }, [filteredUsers, searchTerm, roleFilter, statusFilter, categoryFilter]);

  const togglePasswordVisibility = (userId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 hover:bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-50 hover:bg-green-100 text-green-700";
      case "accepted":
        return "bg-blue-50 hover:bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-50 hover:bg-red-100 text-red-700";
      default:
        return "bg-gray-50 hover:bg-gray-100 text-gray-700";
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los usuarios. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Listado de Usuarios</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              if (value !== "technician") {
                setCategoryFilter("todas");
              }
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              <SelectItem value="technician">Técnico</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          {roleFilter === "technician" && (
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Revisión</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Categorías</TableHead>
            <TableHead>Contraseña</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 10 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-lg font-medium">No se encontraron usuarios</p>
                  <p className="text-sm">
                    No hay usuarios que coincidan con los criterios de búsqueda
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>
                  <UserAvatar
                    name={user.name}
                    role={user.role}
                  />
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || "N/A"}</TableCell>
                <TableCell>
                  {user.role === "client" ? "Cliente" : "Técnico"}
                </TableCell>
                <TableCell>
                  <UserStatus status={user.status} />
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`${getReviewStatusColor(user.reviewStatus)} transition-colors duration-200 cursor-pointer`}
                    onClick={() => {
                      if (user.role === 'technician' && ['pending', 'rejected'].includes(user.reviewStatus)) {
                        router.push(`/dashboard/users/review/${user.id}`);
                      }
                    }}
                  >
                    {user.reviewStatus === "pending" && "Pendiente"}
                    {user.reviewStatus === "approved" && "Aprobado"}
                    {user.reviewStatus === "accepted" && "Aceptado"}
                    {user.reviewStatus === "rejected" && "Rechazado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <UserRating rating={user.rating || 0} />
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    {user.categories && user.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.categories.map((category: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {showPassword[user.id] ? user.password : "••••••"}
                    </div>
                    <button 
                      onClick={() => togglePasswordVisibility(user.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showPassword[user.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <UserActions userId={user.id} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
