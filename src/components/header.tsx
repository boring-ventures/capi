"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateTechnicianModal } from "./create-technician-modal";
import UserTypeDialog from "./user-type-dialog";

interface UserManagementHeaderProps {
  users?: any[];
  filters?: {
    searchTerm: string;
    roleFilter: string;
    statusFilter: string;
    categoryFilter?: string;
  };
}

export function UserManagementHeader({
  users = [],
  filters,
}: UserManagementHeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);

  const handleUserTypeSelected = (type: string) => {
    if (type === "Tecnico") {
      setIsCreateModalOpen(true);
    }
  };

  const defaultFilters = {
    searchTerm: "",
    roleFilter: "todos",
    statusFilter: "todos",
    categoryFilter: "todas",
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsTypeDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </div>
      </div>

      <UserTypeDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        onSelect={handleUserTypeSelected}
      />

      <CreateTechnicianModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}
