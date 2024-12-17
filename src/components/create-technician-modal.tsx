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
import { createTechnician } from "@/lib/technicians/actions";
import { updateTechnicianDocuments } from "@/lib/technicians/actions";

interface CreateTechnicianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "personal" | "documents" | "work";

export function CreateTechnicianModal({
  open,
  onOpenChange,
}: CreateTechnicianModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("personal");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePersonalInfo = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      "nombre",
      "apellido",
      "correoElectronico",
      "telefono",
      "direccion",
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
    const hasAnverso = formData.carnetIdentidadAnverso;
    const hasReverso = formData.carnetIdentidadReverso;
    const hasFactura = formData.facturaLuz;
    const hasCertificaciones = Array.isArray(formData.certificaciones) && formData.certificaciones.length > 0;

    const isValid = hasAnverso && hasReverso && hasFactura && hasCertificaciones;
    console.log("Validación de documentos:", {
      hasAnverso,
      hasReverso,
      hasFactura,
      hasCertificaciones,
      isValid,
    });
    return isValid;
  }, [
    formData.carnetIdentidadAnverso,
    formData.carnetIdentidadReverso,
    formData.facturaLuz,
    formData.certificaciones,
  ]);

  const validateWorkInfo = useCallback(() => {
    const requiredFields = [
      "areaTrabajo",
      "anosExperiencia",
      "nombreBanco",
      "numeroCuenta",
      "tipoCuenta",
    ];
    return requiredFields.every((field) => formData[field]);
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

    // Validar después de actualizar los datos
    setTimeout(() => {
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
    }, 0);
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
        };

        // Create user and get ID
        const { userId } = await createTechnician(technicianData);

        // Upload all documents with the user ID
        const uploadPromises = [];
        const uploadedUrls: Record<string, string | string[]> = {};

        if (formData.carnetIdentidadAnverso) {
          uploadPromises.push(
            uploadFile(formData.carnetIdentidadAnverso, userId, "carnet-identidad").then(url => {
              if (url) uploadedUrls.carnetIdentidadAnversoUrl = url;
            })
          );
        }

        if (formData.carnetIdentidadReverso) {
          uploadPromises.push(
            uploadFile(formData.carnetIdentidadReverso, userId, "carnet-identidad").then(url => {
              if (url) uploadedUrls.carnetIdentidadReversoUrl = url;
            })
          );
        }

        if (formData.facturaLuz) {
          uploadPromises.push(
            uploadFile(formData.facturaLuz, userId, "facturas").then(url => {
              if (url) uploadedUrls.facturaLuzUrl = url;
            })
          );
        }

        if (formData.certificaciones) {
          const certPromises = formData.certificaciones.map((cert: File) =>
            uploadFile(cert, userId, "certificaciones")
          );
          const certUrls = await Promise.all(certPromises);
          uploadedUrls.certificacionesUrls = certUrls.filter(url => url !== null) as string[];
        }

        await Promise.all(uploadPromises);

        // Update the technician record with the document URLs
        await updateTechnicianDocuments(userId, {
          carnet_identidad_anverso: uploadedUrls.carnetIdentidadAnversoUrl as string,
          carnet_identidad_reverso: uploadedUrls.carnetIdentidadReversoUrl as string,
          factura_luz: uploadedUrls.facturaLuzUrl as string,
          certificaciones: uploadedUrls.certificacionesUrls as string[],
        });

        console.log("Técnico registrado exitosamente");
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
          />
        );
      case "documents":
        return (
          <DocumentsForm onChange={handleFieldChange} values={formData} />
        );
      case "work":
        return <WorkInfoForm onChange={handleFieldChange} values={formData} />;
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
      <DialogContent className="max-w-2xl">
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
              <Button onClick={handleNext} disabled={!isValid || isLoading}>
                Continuar
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
                {isLoading ? "Subiendo..." : "Registrar Técnico"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
