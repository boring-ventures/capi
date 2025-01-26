'use client'

import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useServices } from "@/hooks/useServices"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export function KpiDashboard() {
  const { data: services, isLoading } = useServices()

  const metrics = useMemo(() => {
    if (!services) return {
      activeServices: 0,
      completedServices: 0,
      averageRating: 0,
      averageResolutionTime: 0
    }

    const activeServices = services.filter(s => 
      s.status === 'created' || s.status === 'in_progress'
    ).length

    const completedServices = services.filter(s => 
      s.status === 'completed'
    ).length

    const techniciansWithRating = services
      .filter(s => s.technician && s.technician.rating)
      .map(s => s.technician!.rating)

    const averageRating = techniciansWithRating.length
      ? (techniciansWithRating.reduce((a, b) => a + b, 0) / techniciansWithRating.length).toFixed(1)
      : 0

    // Calcular tiempo promedio de resolución para servicios completados
    const completedWithDates = services.filter(s => 
      s.status === 'completed' && s.request_date && s.acceptance_date
    )

    const averageResolutionTime = completedWithDates.length
      ? completedWithDates.reduce((acc, service) => {
          const start = new Date(service.request_date)
          const end = new Date(service.acceptance_date!)
          return acc + (end.getTime() - start.getTime())
        }, 0) / (completedWithDates.length * 3600000) // Convertir a horas
      : 0

    return {
      activeServices,
      completedServices,
      averageRating,
      averageResolutionTime: averageResolutionTime.toFixed(1)
    }
  }, [services])

  // Datos para el gráfico de barras (últimos 7 días)
  const barData = useMemo(() => {
    if (!services) return {
      labels: [],
      datasets: [{ data: [], backgroundColor: "rgb(147, 147, 223)" }]
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    const servicesByDay = last7Days.map(date =>
      services.filter(s => s.request_date.startsWith(date)).length
    )

    return {
      labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
      datasets: [{
        data: servicesByDay,
        backgroundColor: "rgb(147, 147, 223)",
      }]
    }
  }, [services])

  // Datos para el gráfico circular
  const pieData = useMemo(() => {
    if (!services) return {
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
    }

    const statusCount = {
      completed: services.filter(s => s.status === 'completed').length,
      in_progress: services.filter(s => s.status === 'in_progress').length,
      canceled: services.filter(s => s.status === 'canceled').length,
    }

    return {
      labels: ["Completado", "En Progreso", "Cancelado"],
      datasets: [{
        data: [statusCount.completed, statusCount.in_progress, statusCount.canceled],
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
        ],
      }]
    }
  }, [services])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  if (isLoading) {
    return <div className="p-8 text-center">Cargando métricas...</div>
  }

  return (
    <div className="p-3 space-y-3 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Análisis y Reportes de KPIs</h1>
        <div className="relative w-72">
          <Input
            placeholder="Buscar métricas..."
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeServices}</div>
            <p className="text-xs text-muted-foreground">Servicios en proceso</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Completados</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completedServices}</div>
            <p className="text-xs text-muted-foreground">Total de servicios finalizados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRating}</div>
            <p className="text-xs text-muted-foreground">Promedio de técnicos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio de Resolución</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">Tiempo promedio de finalización</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comportamiento de la Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barData} options={chartOptions} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estado de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie data={pieData} options={pieOptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}