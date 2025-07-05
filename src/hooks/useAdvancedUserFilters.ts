import { useState, useMemo } from "react";
import { type User } from "@/types/user";

interface UserStats {
  total: number;
  technicians: number;
  clients: number;
  active: number;
  inactive: number;
  pending: number;
  approved: number;
  rejected: number;
  todayRegistrations: number;
}

interface UseAdvancedUserFiltersProps {
  users: User[];
}

export function useAdvancedUserFilters({ users }: UseAdvancedUserFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("todos");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Búsqueda por texto
      const searchMatch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por rol
      const roleMatch =
        roleFilter === "todos" || user.role === roleFilter;

      // Filtro por estado
      const statusMatch =
        statusFilter === "todos" || user.status === statusFilter;

      // Filtro por estado de revisión (solo para técnicos)
      const reviewStatusMatch =
        reviewStatusFilter === "todos" ||
        (user.role === "technician" && user.reviewStatus === reviewStatusFilter);

      // Filtro por categorías
      const categoryMatch =
        selectedCategories.length === 0 ||
        (user.role === "technician" &&
          Array.isArray(user.categoryIds) &&
          selectedCategories.every(cat => user.categoryIds?.includes(cat)));

      // Filtro por fecha
      let dateMatch = true;
      if (dateFilter !== "todos") {
        const userDate = new Date(user.created_at);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        switch (dateFilter) {
          case "today":
            dateMatch = userDate >= startOfDay;
            break;
          case "this-week":
            dateMatch = userDate >= startOfWeek;
            break;
          case "this-month":
            dateMatch = userDate >= startOfMonth;
            break;
          case "last-month":
            dateMatch = userDate >= startOfLastMonth && userDate <= endOfLastMonth;
            break;
        }
      }

      return (
        searchMatch &&
        roleMatch &&
        statusMatch &&
        reviewStatusMatch &&
        categoryMatch &&
        dateMatch
      );
    });
  }, [users, searchTerm, roleFilter, statusFilter, reviewStatusFilter, selectedCategories, dateFilter]);

  // Calcular estadísticas
  const stats: UserStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseStats = {
      total: filteredUsers.length,
      technicians: 0,
      clients: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      todayRegistrations: 0,
    };

    return filteredUsers.reduce((acc, user) => {
      // Contar por rol
      if (user.role === "technician") {
        acc.technicians++;
        // Contar estados de revisión solo para técnicos
        if (user.reviewStatus === "pending") acc.pending++;
        if (user.reviewStatus === "approved") acc.approved++;
        if (user.reviewStatus === "rejected") acc.rejected++;
      } else {
        acc.clients++;
      }

      // Contar por estado
      if (user.status === "active") acc.active++;
      if (user.status === "inactive") acc.inactive++;

      // Contar registros de hoy
      const userDate = new Date(user.created_at);
      if (userDate >= today) {
        acc.todayRegistrations++;
      }

      return acc;
    }, baseStats);
  }, [filteredUsers]);

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Contador de filtros activos
  const activeFiltersCount = [
    searchTerm !== "",
    roleFilter !== "todos",
    statusFilter !== "todos",
    reviewStatusFilter !== "todos",
    selectedCategories.length > 0,
    dateFilter !== "todos",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("todos");
    setStatusFilter("todos");
    setReviewStatusFilter("todos");
    setSelectedCategories([]);
    setDateFilter("todos");
    setCurrentPage(1);
  };

  return {
    filteredUsers,
    paginatedUsers,
    stats,
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
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    activeFiltersCount,
    clearFilters,
    totalItems: filteredUsers.length,
  };
} 