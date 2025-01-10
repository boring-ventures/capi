"use client"

import { AlertTriangle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DisputeProps {
  id: string
  type: "dispute" | "critical"
  client: string
  technician: string
  onManage: (id: string) => void
  onIntervene: (id: string) => void
}

export function DisputesPanel() {
  const disputes = [
    {
      id: "1235",
      type: "dispute",
      client: "Ana López",
      technician: "Carlos Ruiz",
    },
    {
      id: "1236",
      type: "critical",
      client: "Pedro Sánchez",
      technician: "Laura Martinez",
    },
  ]

  const handleManage = (id: string) => {
    // Handle manage action
  }

  const handleIntervene = (id: string) => {
    // Handle intervene action
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Panel de Disputas</h2>
      
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <Card key={dispute.id} className={dispute.type === "critical" ? "bg-red-50" : "bg-yellow-50"}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {dispute.type === "critical" ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {dispute.type === "critical" ? "Problema Crítico" : "Disputa"} en Servicio #{dispute.id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {dispute.client} | Técnico: {dispute.technician}
                  </p>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => dispute.type === "critical" ? handleIntervene(dispute.id) : handleManage(dispute.id)}
              >
                {dispute.type === "critical" ? "Intervenir" : "Gestionar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

