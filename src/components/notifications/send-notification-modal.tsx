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
  CheckCircle,
  Search
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useSendManualNotification, 
  useSendManualNotificationToClient,
  useSendBulkManualNotifications,
  useTestPushNotificationConnection 
} from "@/hooks/useNotifications";
import { useUsers, useCategories } from "@/hooks/useUsers";

// Esquemas de validación
const individualNotificationSchema = z.object({
  user_type: z.enum(["technician", "client"]),
  user_id: z.string().min(1, "Selecciona un usuario"),
  service_id: z.string().optional(),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  body: z.string().min(1, "El mensaje es requerido").max(500, "Máximo 500 caracteres"),
});

const bulkNotificationSchema = z.object({
  target_type: z.enum(["all_technicians", "technicians_by_category", "specific_technicians", "all_clients", "specific_clients"]),
  target_ids: z.array(z.string()).optional(),
  title: z.string().min(1, "El título es requerido").max(100, "Máximo 100 caracteres"),
  body: z.string().min(1, "El mensaje es requerido").max(500, "Máximo 500 caracteres"),
});

type IndividualNotificationFormData = z.infer<typeof individualNotificationSchema>;
type BulkNotificationFormData = z.infer<typeof bulkNotificationSchema>;

interface SendNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendNotificationModal({ open, onOpenChange }: SendNotificationModalProps) {
  const [activeTab, setActiveTab] = useState("individual");
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const sendManualNotification = useSendManualNotification();
  const sendManualNotificationToClient = useSendManualNotificationToClient();
  const sendBulkManualNotifications = useSendBulkManualNotifications();
  const { data: pushConnectionWorking, isLoading: testingConnection } = useTestPushNotificationConnection();
  const { data: users = [] } = useUsers();
  const { data: categories = [] } = useCategories();

  // Filtrar técnicos y clientes activos
  const technicians = users.filter(user => user.role === "technician" && user.status === "active");
  const clients = users.filter(user => user.role === "client" && user.status === "active");

  // Filtrar técnicos y clientes según búsqueda
  const filteredTechnicians = technicians.filter(tech => 
    tech.name.toLowerCase().includes(technicianSearch.toLowerCase()) ||
    tech.email.toLowerCase().includes(technicianSearch.toLowerCase())
  );

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const individualForm = useForm<IndividualNotificationFormData>({
    resolver: zodResolver(individualNotificationSchema),
    defaultValues: {
      user_type: "technician",
      user_id: "",
      service_id: "",
      title: "",
      body: "",
    },
  });

  const bulkForm = useForm<BulkNotificationFormData>({
    resolver: zodResolver(bulkNotificationSchema),
    defaultValues: {
      target_type: "all_technicians",
      target_ids: [],
      title: "",
      body: "",
    },
  });

  const handleClose = () => {
    individualForm.reset();
    bulkForm.reset();
    setSelectedTechnicians([]);
    setSelectedClients([]);
    setSelectedCategories([]);
    setTechnicianSearch("");
    setClientSearch("");
    onOpenChange(false);
  };

  const onSubmitIndividual = async (data: IndividualNotificationFormData) => {
    try {
      if (data.user_type === "technician") {
        await sendManualNotification.mutateAsync({
          technicianId: data.user_id,
          title: data.title,
          body: data.body,
          serviceId: data.service_id || undefined,
          data: { type: 'manual', source: 'dashboard' }
        });
      } else {
        await sendManualNotificationToClient.mutateAsync({
          clientId: data.user_id,
          title: data.title,
          body: data.body,
          serviceId: data.service_id || undefined,
          data: { type: 'manual', source: 'dashboard' }
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const onSubmitBulk = async (data: BulkNotificationFormData) => {
    try {
      let userIds: string[] = [];

      switch (data.target_type) {
        case "all_technicians":
          userIds = technicians.map(t => t.id);
          break;
        case "technicians_by_category":
          userIds = technicians.filter(tech => 
            Array.isArray(tech.categoryIds) && 
            tech.categoryIds.some(catId => selectedCategories.includes(catId))
          ).map(t => t.id);
          break;
        case "specific_technicians":
          userIds = selectedTechnicians;
          break;
        case "all_clients":
          userIds = clients.map(c => c.id);
          break;
        case "specific_clients":
          userIds = selectedClients;
          break;
      }

      await sendBulkManualNotifications.mutateAsync({
        userIds,
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

  const toggleClient = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
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
    const targetType = bulkForm.watch("target_type");
    switch (targetType) {
      case "all_technicians":
        return technicians.length;
      case "technicians_by_category":
        return technicians.filter(tech => 
          Array.isArray(tech.categoryIds) && 
          tech.categoryIds.some(catId => selectedCategories.includes(catId))
        ).length;
      case "specific_technicians":
        return selectedTechnicians.length;
      case "all_clients":
        return clients.length;
      case "specific_clients":
        return selectedClients.length;
      default:
        return 0;
    }
  };

  const userTypeOptions = [
    { value: "technician", label: "Técnico" },
    { value: "client", label: "Cliente" },
  ];

  const currentUserType = individualForm.watch("user_type");
  const currentUsers = currentUserType === "client" ? filteredClients : filteredTechnicians;
  const currentSearch = currentUserType === "client" ? clientSearch : technicianSearch;
  const setCurrentSearch = currentUserType === "client" ? setClientSearch : setTechnicianSearch;

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
                Push notifications activas ✅
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                Push notifications no disponibles - Modo fallback activo
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
                {/* Tipo de usuario */}
                <FormField
                  control={individualForm.control}
                  name="user_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Destinatario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Buscador */}
                <div className="space-y-2">
                  <FormLabel>
                    Buscar {currentUserType === "client" ? "Clientes" : "Técnicos"}
                  </FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Buscar ${currentUserType === "client" ? "clientes" : "técnicos"}...`}
                      value={currentSearch}
                      onChange={(e) => setCurrentSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Selección de usuario específico */}
                <FormField
                  control={individualForm.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {currentUserType === "client" ? "Cliente Destinatario" : "Técnico Destinatario"}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Selecciona un ${currentUserType === "client" ? "cliente" : "técnico"}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {currentUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <span>{user.name}</span>
                                {currentUserType === "technician" ? (
                                  <Badge variant="outline">⭐ {user.rating}</Badge>
                                ) : (
                                  <span className="text-xs text-gray-500">({user.email})</span>
                                )}
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
                    disabled={sendManualNotification.isPending || sendManualNotificationToClient.isPending}
                    className="flex items-center gap-2"
                  >
                    {(sendManualNotification.isPending || sendManualNotificationToClient.isPending) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {pushConnectionWorking ? "Enviar + Push 🚀" : "Enviar (Fallback) 📱"}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                          <SelectItem value="all_clients">
                            Todos los clientes activos ({clients.length})
                          </SelectItem>
                          <SelectItem value="specific_clients">
                            Clientes específicos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Selección de categorías */}
                {bulkForm.watch("target_type") === "technicians_by_category" && (
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
                {bulkForm.watch("target_type") === "specific_technicians" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Seleccionar Técnicos</CardTitle>
                      {/* Buscador para técnicos */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar técnicos..."
                          value={technicianSearch}
                          onChange={(e) => setTechnicianSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredTechnicians.map((technician) => (
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

                {/* Selección de clientes específicos */}
                {bulkForm.watch("target_type") === "specific_clients" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Seleccionar Clientes</CardTitle>
                      {/* Buscador para clientes */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar clientes..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div key={client.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={client.id}
                            checked={selectedClients.includes(client.id)}
                            onCheckedChange={() => toggleClient(client.id)}
                          />
                          <label htmlFor={client.id} className="text-sm font-medium flex-1">
                            {client.name}
                          </label>
                          <span className="text-xs text-gray-500">
                            {client.email}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Información de destinatarios */}
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Se enviará la notificación a {getTargetCount()} usuario(s)
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
                    {pushConnectionWorking ? 
                      `Enviar + Push a ${getTargetCount()} usuario(s) 🚀` : 
                      `Enviar a ${getTargetCount()} usuario(s) (Fallback) 📱`
                    }
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