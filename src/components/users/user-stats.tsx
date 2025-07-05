"use client";

import { Card } from "@/components/ui/card";
import { type UserStats as UserStatsType } from "@/types/user";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface UserStatsProps {
  stats: UserStatsType;
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-6 flex items-center space-x-4">
          <Users className="h-6 w-6 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Técnicos: {stats.technicians}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Clientes: {stats.clients}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 flex items-center space-x-4">
          <UserCheck className="h-6 w-6 text-green-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Usuarios Activos</p>
            <h3 className="text-2xl font-bold">{stats.active}</h3>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Inactivos: {stats.inactive}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 flex items-center space-x-4">
          <UserX className="h-6 w-6 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Técnicos Pendientes</p>
            <h3 className="text-2xl font-bold">{stats.pending}</h3>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Aprobados: {stats.approved}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">Rechazados: {stats.rejected}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 flex items-center space-x-4">
          <Clock className="h-6 w-6 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Registros Hoy</p>
            <h3 className="text-2xl font-bold">{stats.todayRegistrations}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
} 