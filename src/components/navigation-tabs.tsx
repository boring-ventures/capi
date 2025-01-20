"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export function NavigationTabs() {
  return (
    <Tabs defaultValue="requests" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="config" asChild>
          <Link href="/config">Configuración de Servicios</Link>
        </TabsTrigger>
        <TabsTrigger value="requests" asChild>
          <Link href="/requests">Control de Solicitudes</Link>
        </TabsTrigger>
        <TabsTrigger value="disputes" asChild>
          <Link href="/disputes">Resolución de Disputas</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

