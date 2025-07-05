"use client";

import { useState, useCallback, useRef } from "react";
import { AdvancedUserHeader } from "@/components/users/advanced-user-header"
import { AdvancedUsersTable } from "@/components/users/advanced-users-table"
import { useUsers } from "@/hooks/useUsers";
import { type User } from "@/types/user";

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  technicians: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    accepted: number;
  };
  clients: {
    total: number;
  };
  todayRegistrations: number;
}

interface FilterState {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  reviewStatusFilter: string;
  categoryFilter?: string;
  dateFilter: string;
}

export default function UserManagementPage() {
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    searchTerm: "",
    roleFilter: "todos",
    statusFilter: "todos",
    reviewStatusFilter: "todos",
    dateFilter: "todos"
  });
  const [currentStats, setCurrentStats] = useState<UserStats | undefined>(undefined);
  
  // Use refs to store current values without triggering re-renders
  const currentValuesRef = useRef<{
    users: User[];
    filters: FilterState;
    stats: UserStats | undefined;
  }>({
    users: [],
    filters: {
      searchTerm: "",
      roleFilter: "todos",
      statusFilter: "todos",
      reviewStatusFilter: "todos",
      dateFilter: "todos"
    },
    stats: undefined
  });

  const handleDataChange = useCallback((users: User[], filters: FilterState, stats: UserStats) => {
    // Only update state if values have actually changed
    const hasChanges = 
      JSON.stringify(currentValuesRef.current.users) !== JSON.stringify(users) ||
      JSON.stringify(currentValuesRef.current.filters) !== JSON.stringify(filters) ||
      JSON.stringify(currentValuesRef.current.stats) !== JSON.stringify(stats);

    if (hasChanges) {
      currentValuesRef.current = { users, filters, stats };
      setFilteredUsers(users);
      setCurrentFilters(filters);
      setCurrentStats(stats);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AdvancedUserHeader 
        users={filteredUsers}
        stats={currentStats}
        filters={currentFilters}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />
      <AdvancedUsersTable onDataChange={handleDataChange} />
    </div>
  )
}

