"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserAvatar } from "./user-avatar"
import { UserStatus } from "./user-status"
import { UserRating } from "./user-rating"
import { UserActions } from "./user-actions"

// Tipo para un usuario
type User = {
  id: string
  name: string
  email: string
  role: 'cliente' | 'trabajador'
  status: 'activo' | 'inactivo'
  rating: number
}

// Datos de ejemplo
const users: User[] = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com', role: 'cliente', status: 'activo', rating: 4 },
  { id: '2', name: 'María García', email: 'maria@example.com', role: 'trabajador', status: 'activo', rating: 5 },
  { id: '3', name: 'Carlos López', email: 'carlos@example.com', role: 'cliente', status: 'inactivo', rating: 3 },
]

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'todos' | 'cliente' | 'trabajador'>('todos')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos')

  const filteredUsers = users.filter(user => 
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'todos' || user.role === roleFilter) &&
    (statusFilter === 'todos' || user.status === statusFilter)
  )

  return (
    <div className="container mx-auto py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Listado de Usuarios</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={roleFilter} onValueChange={(value: 'todos' | 'cliente' | 'trabajador') => setRoleFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Roles</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="trabajador">Trabajador</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value: 'todos' | 'activo' | 'inactivo') => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Estados</SelectItem>
              <SelectItem value="activo">Activo</SelectItem>
              <SelectItem value="inactivo">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Calificación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <UserAvatar name={user.name} role={user.role} />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role === 'cliente' ? 'Cliente' : 'Trabajador'}</TableCell>
              <TableCell>
                <UserStatus status={user.status} />
              </TableCell>
              <TableCell>
                <UserRating rating={user.rating} />
              </TableCell>
              <TableCell>
                <UserActions
                  onView={() => console.log('Ver', user.id)}
                  onEdit={() => console.log('Editar', user.id)}
                  onDelete={() => console.log('Eliminar', user.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

