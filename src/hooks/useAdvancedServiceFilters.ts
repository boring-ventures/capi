import { useState, useMemo } from "react";
import { type ServiceWithDetails } from "@/lib/services/actions";

interface UseAdvancedServiceFiltersProps {
  services: ServiceWithDetails[];
}

interface ServiceStats {
  total: number;
  created: number;
  in_progress: number;
  completed: number;
  canceled: number;
  disputed: number;
  averagePrice: number;
  totalRevenue: number;
  todayServices: number;
  categories: {
    [key: string]: number;
  };
}

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  technicianFilter: string;
  priceRange: [number, number];
  dateFilter: string;
}

export function useAdvancedServiceFilters({ services }: UseAdvancedServiceFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [technicianFilter, setTechnicianFilter] = useState("todos");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [dateFilter, setDateFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Búsqueda por texto
      const searchMatch =
        searchTerm === "" ||
        service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.technician?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estado
      const statusMatch =
        statusFilter === "todos" || service.status === statusFilter;

      // Filtro por categoría
      const categoryMatch =
        categoryFilter === "todas" || service.category.id === categoryFilter;

      // Filtro por técnico
      const technicianMatch =
        technicianFilter === "todos" || 
        (service.technician?.id === technicianFilter) ||
        (technicianFilter === "sin_asignar" && !service.technician);

      // Filtro por rango de precio
      const price = service.agreed_price ?? 0;
      const priceMatch = price >= priceRange[0] && price <= priceRange[1];

      // Filtro por fecha
      let dateMatch = true;
      const serviceDate = new Date(service.request_date);
      const today = new Date();
      
      switch (dateFilter) {
        case "hoy":
          dateMatch = serviceDate.toDateString() === today.toDateString();
          break;
        case "esta_semana":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          dateMatch = serviceDate >= weekStart && serviceDate <= today;
          break;
        case "este_mes":
          dateMatch = 
            serviceDate.getMonth() === today.getMonth() &&
            serviceDate.getFullYear() === today.getFullYear();
          break;
        case "ultimo_mes":
          const lastMonth = new Date(today);
          lastMonth.setMonth(today.getMonth() - 1);
          dateMatch = 
            serviceDate.getMonth() === lastMonth.getMonth() &&
            serviceDate.getFullYear() === lastMonth.getFullYear();
          break;
        default:
          dateMatch = true;
      }

      return searchMatch && statusMatch && categoryMatch && technicianMatch && priceMatch && dateMatch;
    });
  }, [services, searchTerm, statusFilter, categoryFilter, technicianFilter, priceRange, dateFilter]);

  // Estadísticas calculadas
  const stats: ServiceStats = useMemo(() => {
    const total = filteredServices.length;
    const created = filteredServices.filter(s => s.status === "created").length;
    const in_progress = filteredServices.filter(s => s.status === "in_progress").length;
    const completed = filteredServices.filter(s => s.status === "completed").length;
    const canceled = filteredServices.filter(s => s.status === "canceled").length;
    const disputed = filteredServices.filter(s => s.status === "disputed").length;
    
    const prices = filteredServices
      .map(s => s.agreed_price ?? 0)
      .filter(price => price > 0);
    
    const averagePrice = prices.length > 0 
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : 0;
    
    const totalRevenue = filteredServices
      .filter(s => s.status === "completed")
      .reduce((sum, s) => sum + (s.agreed_price ?? 0), 0);

    const today = new Date();
    const todayServices = filteredServices.filter(s => 
      new Date(s.request_date).toDateString() === today.toDateString()
    ).length;

    // Contar servicios por categoría
    const categories: { [key: string]: number } = {};
    filteredServices.forEach(service => {
      const categoryName = service.category.name;
      categories[categoryName] = (categories[categoryName] || 0) + 1;
    });

    return {
      total,
      created,
      in_progress,
      completed,
      canceled,
      disputed,
      averagePrice,
      totalRevenue,
      todayServices,
      categories
    };
  }, [filteredServices]);

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "todos") count++;
    if (categoryFilter !== "todas") count++;
    if (technicianFilter !== "todos") count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (dateFilter !== "todos") count++;
    return count;
  }, [searchTerm, statusFilter, categoryFilter, technicianFilter, priceRange, dateFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setCategoryFilter("todas");
    setTechnicianFilter("todos");
    setPriceRange([0, 10000]);
    setDateFilter("todos");
    setCurrentPage(1);
  };

  return {
    filteredServices,
    paginatedServices,
    stats,
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
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    activeFiltersCount,
    clearFilters,
    totalItems: filteredServices.length,
  };
} 