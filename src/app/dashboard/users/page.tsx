"use client";

import { useState, useCallback } from "react";
import { UserManagementHeader } from "@/components/header"
import { UsersTable } from "@/components/users-table"

export default function UserManagementPage() {
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const handleDataChange = useCallback((users: any[], filters: any) => {
    setFilteredUsers(users);
    setCurrentFilters(filters);
  }, []);

  return (
    <div className="container mx-auto p-3 space-y-3">
      <UserManagementHeader 
        users={filteredUsers}
        filters={currentFilters}
      />
      <UsersTable onDataChange={handleDataChange} />
    </div>
  )
}

