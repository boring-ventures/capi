"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonalInfoForm } from "./personal-info-form";
import { DocumentsForm } from "./documents-form";
import { WorkInfoForm } from "./work-info-form";
import { uploadFile } from "@/utils/storage-utils";
import { updateTechnicianDocuments } from "@/lib/technicians/actions";
import { useCreateTechnician } from "@/hooks/useTechnicians";

interface CreateTechnicianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "personal" | "documents" | "work";

function generateRandomPassword() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function CreateTechnicianModal({
  open,
  onOpenChange,
}: CreateTechnicianModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const createTechnicianMutation = useCreateTechnician();

  const validatePersonalInfo = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "nombre",
      "apellido",
      "correoElectronico",
      "telefono",
      "direccion",
      "fechaNacimiento",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "Este campo es requerido";
      }
    });

    if (
      formData.correoElectronico &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)
    ) {
      newErrors.correoElectronico = "El correo electrónico no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateDocuments = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const requiredDocs = [
      "carnetIdentidadAnverso",
      "carnetIdentidadReverso",
      "facturaLuz",
    ];

    requiredDocs.forEach((doc) => {
      if (!formData[doc]) {
        newErrors[doc] = "Este documento es requerido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateWorkInfo = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ["areaTrabajo", "anosExperiencia"];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Este campo es requerido";
      }
    });

    if (formData.anosExperiencia && isNaN(Number(formData.anosExperiencia))) {
      newErrors.anosExperiencia = "Debe ser un número válido";
    }

    if (!formData.areaTrabajo || formData.areaTrabajo.length === 0) {
      newErrors.areaTrabajo = "Debe seleccionar al menos un área de trabajo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      return newData;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validar inmediatamente después de actualizar los datos
    let valid = false;
    switch (currentStep) {
      case "personal":
        valid = validatePersonalInfo();
        break;
      case "documents":
        valid = validateDocuments();
        break;
      case "work":
        valid = validateWorkInfo();
        break;
    }
    setIsValid(valid);
  };

  const handleNext = () => {
    if (currentStep === "personal" && validatePersonalInfo()) {
      setCurrentStep("documents");
      setIsValid(validateDocuments());
    } else if (currentStep === "documents" && validateDocuments()) {
      setCurrentStep("work");
      setIsValid(validateWorkInfo());
    }
  };

  const handleBack = () => {
    if (currentStep === "documents") {
      setCurrentStep("personal");
      setIsValid(validatePersonalInfo());
    } else if (currentStep === "work") {
      setCurrentStep("documents");
      setIsValid(validateDocuments());
    }
  };

  const handleSubmit = async () => {
    if (validateWorkInfo()) {
      setIsLoading(true);
      try {
        // First create the user and get the ID
        const technicianData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          correoElectronico: formData.correoElectronico,
          telefono: formData.telefono,
          direccion: formData.direccion,
          areaTrabajo: formData.areaTrabajo,
          anosExperiencia: formData.anosExperiencia,
          nombreBanco: formData.nombreBanco,
          numeroCuenta: formData.numeroCuenta,
          tipoCuenta: formData.tipoCuenta,
          contraseña: generateRandomPassword(),
          fechaNacimiento: formData.fechaNacimiento,
          created_at: new Date().toISOString(),
          reviewStatus: "approved",
        };

        const response = await createTechnicianMutation.mutateAsync(
          technicianData
        );

        if (response.error || !response.data) {
          throw new Error(response.error || "Error desconocido");
        }

        const userId = response.data.userId;

        // Upload all documents with the user ID
        const uploadPromises = [];
        const uploadedUrls: Record<string, string | string[]> = {};

        if (formData.carnetIdentidadAnverso) {
          uploadPromises.push(
            uploadFile(
              formData.carnetIdentidadAnverso,
              userId,
              "carnet-identidad"
            ).then((url) => {
              if (url) uploadedUrls.carnetIdentidadAnversoUrl = url;
            })
          );
        }

        if (formData.carnetIdentidadReverso) {
          uploadPromises.push(
            uploadFile(
              formData.carnetIdentidadReverso,
              userId,
              "carnet-identidad"
            ).then((url) => {
              if (url) uploadedUrls.carnetIdentidadReversoUrl = url;
            })
          );
        }

        if (formData.facturaLuz) {
          uploadPromises.push(
            uploadFile(formData.facturaLuz, userId, "facturas").then((url) => {
              if (url) uploadedUrls.facturaLuzUrl = url;
            })
          );
        }

        await Promise.all(uploadPromises);

        // Update the technician record with the document URLs
        await updateTechnicianDocuments(userId, {
          carnet_identidad_anverso:
            uploadedUrls.carnetIdentidadAnversoUrl as string,
          carnet_identidad_reverso:
            uploadedUrls.carnetIdentidadReversoUrl as string,
          factura_luz: uploadedUrls.facturaLuzUrl as string,
        });

        // Limpiar el estado del formulario después de la creación exitosa
        setFormData({});
        setErrors({});
        setIsValid(false);
        setCurrentStep("personal");

        onOpenChange(false);
      } catch (error) {
        console.error("Error al registrar técnico:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "personal":
        return (
          <PersonalInfoForm
            onChange={handleFieldChange}
            errors={errors}
            values={formData}
            validatePersonalInfo={validatePersonalInfo}
          />
        );
      case "documents":
        return (
          <DocumentsForm
            errors={errors}
            onChange={handleFieldChange}
            values={formData}
            validateDocuments={validateDocuments}
          />
        );
      case "work":
        return (
          <WorkInfoForm
            onChange={handleFieldChange}
            values={formData}
            errors={errors}
            validateWorkInfo={validateWorkInfo}
          />
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "personal":
        return "Información Personal";
      case "documents":
        return "Documentos Requeridos";
      case "work":
        return "Información Laboral";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {currentStep === "personal" &&
              "Complete la información personal del técnico"}
            {currentStep === "documents" && "Suba los documentos requeridos"}
            {currentStep === "work" && "Complete la información laboral"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">{renderStepContent()}</div>

        <div className="flex justify-between mt-1">
          {currentStep !== "personal" && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Regresar
            </Button>
          )}
          <div className="ml-auto">
            {currentStep !== "work" ? (
              <Button onClick={handleNext} disabled={isLoading}>
                Continuar
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Subiendo..." : "Registrar Técnico"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
