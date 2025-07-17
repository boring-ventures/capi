"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Send, 
  Users, 
  User, 
  Settings, 
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useSendManualNotification, 
  useSendBulkManualNotifications,
  useTestPushNotificationConnection 
} from "@/hooks/useNotifications";
import { useUsers, useCategories } from "@/hooks/useUsers";

// Esquemas de validación
const individualNotificationSchema = z.object({
  technician_id: z.string().min(1, "Selecciona un técnico"),
  service_id: z.string().optional(),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  body: z.string().min(1, "El mensaje es requerido").max(500, "Máximo 500 caracteres"),
});

const bulkNotificationSchema = z.object({
  target_type: z.enum(["all_technicians", "technicians_by_category", "specific_technicians"]),
  target_ids: z.array(z.string()).optional(),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  body: z.string().min(1, "El mensaje es requerido").max(500, "Máximo 500 caracteres"),
});

type BulkNotificationFormData = z.infer<typeof bulkNotificationSchema>;

interface SendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationModal({ open, onOpenChange }: SendNotificationModalProps) {
  const [activeTab, setActiveTab] = useState("individual");
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const sendManualNotification = useSendManualNotification();
  const sendBulkManualNotifications = useSendBulkManualNotifications();
  const { data: pushConnectionWorking, isLoading: testingConnection } = useTestPushNotificationConnection();
  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();

  // Filtrar solo técnicos activos
  const technicians = users.filter(user => user.role === "technician" && user.status === "active");

  const individualForm = useForm({
    resolver: zodResolver(individualNotificationSchema),
    defaultValues: {
      technician_id: "",
      service_id: "",
      title: "",
      body: "",
    },
  });

  const bulkForm = useForm<BulkNotificationFormData>({
    resolver: zodResolver(bulkNotificationSchema),
    defaultValues: {
      target_type: "all_technicians" as BulkNotificationFormData["target_type"],
      target_ids: [],
      title: "",
      body: "",
    },
  });

  const handleClose = () => {
    individualForm.reset();
    bulkForm.reset();
    setSelectedTechnicians([]);
    setSelectedCategories([]);
    onOpenChange(false);
  };

  const onSubmitIndividual = async (data: z.infer<typeof individualNotificationSchema>) => {
    try {
      await sendManualNotification.mutateAsync({
        technicianId: data.technician_id,
        title: data.title,
        body: data.body,
        serviceId: data.service_id || undefined,
        data: { type: 'manual', source: 'dashboard' }
      });
      handleClose();
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const onSubmitBulk = async (data: BulkNotificationFormData) => {
    try {
      let technicianIds: string[] = [];

      switch (data.target_type) {
        case "all_technicians":
          technicianIds = technicians.map(t => t.id);
          break;
        case "technicians_by_category":
          technicianIds = technicians.filter(tech => 
            Array.isArray(tech.categoryIds) && 
            tech.categoryIds.some(catId => selectedCategories.includes(catId))
          ).map(t => t.id);
          break;
        case "specific_technicians":
          technicianIds = selectedTechnicians;
          break;
      }

      await sendBulkManualNotifications.mutateAsync({
        technicianIds,
        title: data.title,
        body: data.body,
        data: { type: 'bulk_manual', source: 'dashboard' }
      });
      handleClose();
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
    }
  };

  const toggleTechnician = (technicianId: string) => {
    setSelectedTechnicians(prev => 
      prev.includes(technicianId)
        ? prev.filter(id => id !== technicianId)
        : [...prev, technicianId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getTargetCount = () => {
    const targetType = bulkForm.watch("target_type") as BulkNotificationFormData["target_type"];
    switch (targetType) {
      case "all_technicians":
        return technicians.length;
      case "technicians_by_category":
        // Contar técnicos en las categorías seleccionadas
        return technicians.filter(tech => 
          Array.isArray(tech.categoryIds) && 
          tech.categoryIds.some(catId => selectedCategories.includes(catId))
        ).length;
      case "specific_technicians":
        return selectedTechnicians.length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Notificación
          </DialogTitle>
          
          {/* Indicador de estado de push notifications */}
          <div className="flex items-center gap-2 text-sm">
            {testingConnection ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando push notifications...
              </div>
            ) : pushConnectionWorking ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Push notifications activas
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                Push notifications no disponibles - Solo notificación en app
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Masiva
            </TabsTrigger>
          </TabsList>

          {/* Tab: Notificación Individual */}
          <TabsContent value="individual" className="space-y-4 mt-4">
            <Form {...individualForm}>
              <form onSubmit={individualForm.handleSubmit(onSubmitIndividual)} className="space-y-4">
                {/* Selección de técnico */}
                <FormField
                  control={individualForm.control}
                  name="technician_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Técnico Destinatario</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un técnico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians.map((technician) => (
                            <SelectItem key={technician.id} value={technician.id}>
                              <div className="flex items-center gap-2">
                                <span>{technician.name}</span>
                                <Badge variant="outline">⭐ {technician.rating}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID de servicio (opcional) */}
                <FormField
                  control={individualForm.control}
                  name="service_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID de Servicio (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ej: abc123-def456-ghi789"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Título */}
                <FormField
                  control={individualForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Título de la notificación"
                          {...field} 
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensaje */}
                <FormField
                  control={individualForm.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenido de la notificación..."
                          className="min-h-[100px]"
                          {...field}
                          maxLength={500}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendManualNotification.isPending}
                    className="flex items-center gap-2"
                  >
                    {sendManualNotification.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar Notificación + Push
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Tab: Notificación Masiva */}
          <TabsContent value="bulk" className="space-y-4 mt-4">
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onSubmitBulk)} className="space-y-4">
                {/* Tipo de destinatarios */}
                <FormField
                  control={bulkForm.control}
                  name="target_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destinatarios</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all_technicians">
                            Todos los técnicos activos ({technicians.length})
                          </SelectItem>
                          <SelectItem value="technicians_by_category">
                            Técnicos por categoría
                          </SelectItem>
                          <SelectItem value="specific_technicians">
                            Técnicos específicos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selección de categorías */}
                {(bulkForm.watch("target_type") as BulkNotificationFormData["target_type"]) === "technicians_by_category" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Seleccionar Categorías</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <label htmlFor={category.id} className="text-sm font-medium">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Selección de técnicos específicos */}
                {(bulkForm.watch("target_type") as BulkNotificationFormData["target_type"]) === "specific_technicians" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Seleccionar Técnicos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                      {technicians.map((technician) => (
                        <div key={technician.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={technician.id}
                            checked={selectedTechnicians.includes(technician.id)}
                            onCheckedChange={() => toggleTechnician(technician.id)}
                          />
                          <label htmlFor={technician.id} className="text-sm font-medium flex-1">
                            {technician.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            ⭐ {technician.rating}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Información de destinatarios */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se enviará la notificación a {getTargetCount()} técnico(s)
                  </AlertDescription>
                </Alert>

                {/* Título */}
                <FormField
                  control={bulkForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Título de la notificación"
                          {...field} 
                          maxLength={100}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mensaje */}
                <FormField
                  control={bulkForm.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensaje</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Contenido de la notificación..."
                          className="min-h-[100px]"
                          {...field}
                          maxLength={500}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sendBulkManualNotifications.isPending || getTargetCount() === 0}
                    className="flex items-center gap-2"
                  >
                    {sendBulkManualNotifications.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar + Push a {getTargetCount()} técnico(s)
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 