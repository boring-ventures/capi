"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PersonalInfoForm } from "./personal-info-form";
import { DocumentsForm } from "./documents-form";
import { WorkInfoForm } from "./work-info-form";
import type { TechnicalFormData } from "./types";
import { createUser } from "@/lib/users/actions";
import { toast } from "sonner";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const [formData, setFormData] = useState<Partial<TechnicalFormData>>({});
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }
    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es requerido";
    }
    if (!formData.correoElectronico?.trim()) {
      newErrors.correoElectronico = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El correo electrónico no es válido";
    }
    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (!validatePersonalInfo()) {
      setActiveTab("personal");
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = {
        name: `${formData.nombre} ${formData.apellido}`,
        email: formData.correoElectronico,
        phone: formData.telefono,
        role: "Technician",
        status: "Active",
      };

      await createUser(userData);
      toast.success("Técnico registrado exitosamente");
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al registrar el técnico");
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[96vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Técnico</DialogTitle>
          <DialogDescription>
            Ingrese los datos detallados del nuevo técnico. Los campos marcados
            con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="work">Información Laboral</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1">
            <TabsContent value="personal" className="mt-4">
              <PersonalInfoForm
                onChange={handleFieldChange}
                errors={errors}
                values={formData}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentsForm onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="work" className="mt-4">
              <WorkInfoForm onChange={handleFieldChange} />
            </TabsContent>
          </div>
        </Tabs>

        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los campos marcados con * son obligatorios para completar el
            registro.
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Técnico"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
