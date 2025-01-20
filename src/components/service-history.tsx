'use client'

import * as React from 'react'
import { Search, FileDown, Eye } from 'lucide-react'
import { format, isEqual, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { unparse } from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useServices } from "@/hooks/useServices"
import { ServiceDetailsModal } from "./service-details-modal"
import type { ServiceWithDetails } from "@/lib/services/actions"
import { serviceStatusMap } from "@/lib/services/utils"

export default function ServiceHistory() {
  const [search, setSearch] = React.useState('')
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [selectedStatus, setSelectedStatus] = React.useState<string>("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")
  const [selectedService, setSelectedService] = React.useState<ServiceWithDetails | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false)
  
  const { data: services, isLoading } = useServices()

  const filteredServices = React.useMemo(() => {
    if (!services) return []

    return services.filter(service => {
      const searchTerm = search.toLowerCase()
      const matchesSearch = 
        service.id.slice(0, 4).toLowerCase().includes(searchTerm) ||
        service.client.name.toLowerCase().includes(searchTerm) ||
        service.technician?.name?.toLowerCase().includes(searchTerm)

      const matchesDate = !selectedDate || 
        format(parseISO(service.request_date), 'yyyy-MM-dd') === 
        format(selectedDate, 'yyyy-MM-dd')

      const matchesStatus = !selectedStatus || service.status === selectedStatus
      const matchesCategory = !selectedCategory || service.category.id === selectedCategory

      return matchesSearch && matchesDate && matchesStatus && matchesCategory
    })
  }, [services, search, selectedDate, selectedStatus, selectedCategory])

  const uniqueCategories = React.useMemo(() => {
    if (!services) return []
    
    const categories = new Map()
    services.forEach(service => {
      if (!categories.has(service.category.id)) {
        categories.set(service.category.id, service.category)
      }
    })
    
    return Array.from(categories.values())
  }, [services])

  const handleViewDetails = (service: ServiceWithDetails) => {
    setSelectedService(service)
    setIsDetailsModalOpen(true)
  }

  const getExportFileName = (extension: string) => {
    const now = new Date()
    return `TaskibaraHistorial_${format(now, 'yyyyMMdd_HHmmss')}.${extension}`
  }

  const formatServiceForExport = (service: ServiceWithDetails) => ({
    'ID': service.id.slice(0, 4),
    'Cliente': service.client.name,
    'Técnico': service.technician?.name ?? "Sin asignar",
    'Estado': serviceStatusMap[service.status]?.label ?? service.status,
    'Fecha': format(new Date(service.request_date), 'dd/MM/yyyy HH:mm'),
    'Precio (Bs.)': service.agreed_price?.toFixed(2) ?? "0.00",
    'Categoría': service.category.name,
    'Subcategoría': service.subcategory.name,
    'Dirección': service.location.address,
    'Descripción': service.description,
  })

  const handleExportCSV = () => {
    if (!filteredServices.length) return

    const data = filteredServices.map(formatServiceForExport)
    const csv = unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = getExportFileName('csv')
    link.click()
    setExportDialogOpen(false)
  }

  const handleExportPDF = () => {
    if (!filteredServices.length) return

    const doc = new jsPDF()
    const data = filteredServices.map(service => [
      service.id.slice(0, 4),
      service.client.name,
      service.technician?.name ?? "Sin asignar",
      serviceStatusMap[service.status]?.label ?? service.status,
      format(new Date(service.request_date), 'dd/MM/yyyy HH:mm'),
      `Bs. ${service.agreed_price?.toFixed(2) ?? "0.00"}`,
    ])

    doc.setFontSize(20)
    doc.text('Historial de Servicios - Taskibara', 14, 15)
    doc.setFontSize(10)
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25)

    // @ts-ignore
    doc.autoTable({
      head: [['ID', 'Cliente', 'Técnico', 'Estado', 'Fecha', 'Precio']],
      body: data,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 37, 36] },
    })

    doc.save(getExportFileName('pdf'))
    setExportDialogOpen(false)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Historial de Servicios</h1>
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="listado" className="space-y-6">
        <TabsList>
          <TabsTrigger value="listado">Listado de Servicios</TabsTrigger>
        </TabsList>

        <TabsContent value="listado" className="space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedDate(undefined)
                  setSelectedStatus("")
                  setSelectedCategory("")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {selectedDate ? format(selectedDate, 'PP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del Servicio" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(serviceStatusMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Listado de Servicios</h2>
            <Button onClick={() => setExportDialogOpen(true)}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Servicio</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Cargando servicios...
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron servicios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>#{service.id.slice(0, 4)}</TableCell>
                      <TableCell>{service.client.name}</TableCell>
                      <TableCell>{service.technician?.name ?? "Sin asignar"}</TableCell>
                      <TableCell>
                        {serviceStatusMap[service.status]?.label ?? service.status}
                      </TableCell>
                      <TableCell>
                        {format(new Date(service.request_date), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        Bs. {service.agreed_price?.toFixed(2) ?? "0.00"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(service)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Reporte</DialogTitle>
            <DialogDescription>
              Seleccione el formato de exportación para el reporte de servicios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button className="w-full" onClick={handleExportCSV}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar como CSV
            </Button>
            <Button className="w-full" onClick={handleExportPDF}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar como PDF
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setExportDialogOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedService && (
        <ServiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          service={selectedService}
        />
      )}
    </div>
  )
}

