'use client'

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { PersonalInfoForm } from "./personal-info-form"
import { DocumentsForm } from "./documents-form"
import { WorkInfoForm } from "./work-info-form"
import { useUser, useUpdateUser } from "@/hooks/useUsers"
import { Skeleton } from "@/components/ui/skeleton"
import { uploadFile, uploadProfilePhoto } from "@/utils/storage-utils"
import { updateTechnicianDocuments, updateTechnicianWorkInfo } from "@/lib/technicians/actions"
import { supabase } from "@/utils/supabaseClient"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

type Step = "personal" | "documents" | "work"

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  address?: string;
  fechaNacimiento?: string;
  photo_url?: string;
  documents?: {
    carnet_identidad_anverso?: string;
    carnet_identidad_reverso?: string;
    factura_luz?: string;
    certificaciones?: string[];
  };
  workInfo?: {
    area_trabajo?: string[];
    anos_experiencia?: string;
    nombre_banco?: string;
    numero_cuenta?: string;
    tipo_cuenta?: string;
  };
}

interface FormData {
  [key: string]: any;  // Permitir indexación dinámica
  nombre?: string;
  apellido?: string;
  correoElectronico?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  fotoPerfil?: string | File;
  carnetIdentidadAnverso?: string | File;
  carnetIdentidadReverso?: string | File;
  facturaLuz?: string | File;
  certificaciones?: (string | File)[];
  areaTrabajo?: string[];
  anosExperiencia?: string;
  nombreBanco?: string;
  numeroCuenta?: string;
  tipoCuenta?: string;
}

interface TechnicianDocuments {
  carnet_identidad_anverso: string;
  carnet_identidad_reverso: string;
  factura_luz: string;
  certificaciones: string[];
}

interface TechnicianWorkInfo {
  area_trabajo: any; // jsonb type
  anos_experiencia: string;
  nombre_banco?: string;
  numero_cuenta?: string;
  tipo_cuenta?: string;
  category_id: string;
}

export function EditUserModal({ open, onOpenChange, userId }: EditUserModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("personal")
  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const { data: userData, isLoading: isLoadingUser } = useUser(userId) as { data: User | null, isLoading: boolean }
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  useEffect(() => {
    if (userData) {
      const [nombre = "", apellido = ""] = userData.name.split(" ", 2);
      
      // Formatear la fecha para que se muestre correctamente en el input date
      const fechaNacimiento = userData.fechaNacimiento 
        ? new Date(userData.fechaNacimiento).toISOString().split('T')[0]
        : '';

      setFormData({
        nombre,
        apellido,
        correoElectronico: userData.email,
        telefono: userData.phone,
        direccion: userData.address,
        fechaNacimiento,
        // La foto de perfil viene de la tabla user_profile_photos
        fotoPerfil: userData.photo_url,
      });

      // Si es técnico, cargar datos adicionales
      if (userData.role === "technician") {
        // Obtener documentos del técnico
        const fetchTechnicianData = async () => {
          try {
            const { data: documents } = await supabase
              .from("technician_documents")
              .select("*")
              .eq("user_id", userId)
              .single();

            const { data: workInfo } = await supabase
              .from("technician_work_info")
              .select("*")
              .eq("user_id", userId)
              .single();

            setFormData(prev => ({
              ...prev,
              // Documentos del técnico
              carnetIdentidadAnverso: documents?.carnet_identidad_anverso,
              carnetIdentidadReverso: documents?.carnet_identidad_reverso,
              facturaLuz: documents?.factura_luz,
              certificaciones: documents?.certificaciones,
              // Información laboral del técnico
              areaTrabajo: workInfo?.area_trabajo,
              anosExperiencia: workInfo?.anos_experiencia,
              nombreBanco: workInfo?.nombre_banco,
              numeroCuenta: workInfo?.numero_cuenta,
              tipoCuenta: workInfo?.tipo_cuenta,
            }));
          } catch (error) {
            console.error("Error fetching technician data:", error);
          }
        };

        fetchTechnicianData();
      }
    }
  }, [userData, userId]);

  const validatePersonalInfo = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }
    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es requerido"
    }
    if (!formData.correoElectronico?.trim()) {
      newErrors.correoElectronico = "El correo electrónico es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoElectronico)) {
      newErrors.correoElectronico = "El correo electrónico no es válido"
    }
    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    }
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento es requerida"
    }

    console.log('Personal Info Validation - Errors:', newErrors);
    setErrors(newErrors)
    const valid = Object.keys(newErrors).length === 0
    console.log('Personal Info Validation - Is Valid:', valid);
    setIsValid(valid)
    return valid
  }, [formData])

  const validateDocuments = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (userData?.role === "technician") {
      const requiredDocs = [
        "carnetIdentidadAnverso",
        "carnetIdentidadReverso",
        "facturaLuz",
      ]

      requiredDocs.forEach((doc) => {
        if (!formData[doc]) {
          newErrors[doc] = "Este documento es requerido"
        }
      })
    }
    setErrors(newErrors)
    const valid = Object.keys(newErrors).length === 0
    setIsValid(valid)
    return valid
  }, [formData, userData?.role])

  const validateWorkInfo = useCallback(() => {
    const newErrors: Record<string, string> = {}
    if (userData?.role === "technician") {
      if (!formData.areaTrabajo || formData.areaTrabajo.length === 0) {
        newErrors.areaTrabajo = "Debe seleccionar al menos un área de trabajo"
      }
      if (!formData.anosExperiencia) {
        newErrors.anosExperiencia = "Los años de experiencia son requeridos"
      }
    }
    setErrors(newErrors)
    const valid = Object.keys(newErrors).length === 0
    setIsValid(valid)
    return valid
  }, [formData, userData?.role])

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    console.log('Errors:', errors);
    console.log('Is valid:', isValid);
    
    if (currentStep === "personal" && validatePersonalInfo()) {
      setCurrentStep("documents")
    } else if (currentStep === "documents" && validateDocuments()) {
      setCurrentStep("work")
    }
  }

  const handleBack = () => {
    if (currentStep === "documents") {
      setCurrentStep("personal")
    } else if (currentStep === "work") {
      setCurrentStep("documents")
    }
  }

  const handleSubmit = async () => {
    if (!validatePersonalInfo()) {
      return;
    }

    setIsLoading(true);
    try {
      let photoUrl = formData.fotoPerfil;

      // Si hay una nueva foto de perfil, súbela usando la nueva función
      if (formData.fotoPerfil instanceof File) {
        const uploadedPhotoUrl = await uploadProfilePhoto(formData.fotoPerfil, userId);
        photoUrl = uploadedPhotoUrl || undefined;
      }

      // Formatear la fecha de nacimiento
      const formattedDate = formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString() : undefined;

      // Actualizar información básica del usuario
      const basicUserData = {
        name: `${formData.nombre} ${formData.apellido}`,
        email: formData.correoElectronico,
        phone: formData.telefono,
        address: formData.direccion,
        fechaNacimiento: formattedDate,
      };

      await updateUser(
        { id: userId, data: basicUserData },
        {
          onSuccess: async () => {
            // Si es técnico, actualizar documentos e información laboral
            if (userData?.role === "technician") {
              // Actualizar documentos si han cambiado
              if (formData.carnetIdentidadAnverso instanceof File ||
                  formData.carnetIdentidadReverso instanceof File ||
                  formData.facturaLuz instanceof File) {
                const uploadPromises = [];
                const uploadedUrls: Record<string, string> = {};

                if (formData.carnetIdentidadAnverso instanceof File) {
                  const url = await uploadFile(formData.carnetIdentidadAnverso, userId, "carnet-identidad");
                  if (url) uploadedUrls.carnetIdentidadAnversoUrl = url;
                }

                if (formData.carnetIdentidadReverso instanceof File) {
                  const url = await uploadFile(formData.carnetIdentidadReverso, userId, "carnet-identidad");
                  if (url) uploadedUrls.carnetIdentidadReversoUrl = url;
                }

                if (formData.facturaLuz instanceof File) {
                  const url = await uploadFile(formData.facturaLuz, userId, "facturas");
                  if (url) uploadedUrls.facturaLuzUrl = url;
                }

                // Actualizar documentos
                await updateTechnicianDocuments(userId, {
                  carnet_identidad_anverso: uploadedUrls.carnetIdentidadAnversoUrl || formData.carnetIdentidadAnverso as string,
                  carnet_identidad_reverso: uploadedUrls.carnetIdentidadReversoUrl || formData.carnetIdentidadReverso as string,
                  factura_luz: uploadedUrls.facturaLuzUrl || formData.facturaLuz as string,
                  certificaciones: Array.isArray(formData.certificaciones) 
                    ? formData.certificaciones.filter((cert): cert is string => typeof cert === 'string')
                    : [],
                });
              }

              // Actualizar información laboral
              const workInfoData = {
                area_trabajo: formData.areaTrabajo || [],
                anos_experiencia: formData.anosExperiencia || '',
                nombre_banco: formData.nombreBanco,
                numero_cuenta: formData.numeroCuenta,
                tipo_cuenta: formData.tipoCuenta,
                category_id: Array.isArray(formData.areaTrabajo) && formData.areaTrabajo.length > 0 
                  ? formData.areaTrabajo[0] 
                  : undefined
              };

              await updateTechnicianWorkInfo(userId, workInfoData);
            }

            onOpenChange(false);
          },
        }
      );
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    // Si no es técnico, solo mostrar información personal
    if (userData?.role !== "technician") {
      return (
        <PersonalInfoForm
          onChange={handleFieldChange}
          errors={errors}
          values={formData}
          validatePersonalInfo={validatePersonalInfo}
        />
      );
    }

    // Si es técnico, mostrar el paso correspondiente
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
        return "Documentos";
      case "work":
        return "Información Laboral";
    }
  };

  if (isLoadingUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            Modifique los datos del usuario. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {renderStepContent()}
        </div>

        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los campos marcados con * son obligatorios.
          </AlertDescription>
        </Alert>

        <div className="flex justify-between mt-4">
          {currentStep !== "personal" && (
            <Button variant="outline" onClick={handleBack} disabled={isLoading || isUpdating}>
              Regresar
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {userData?.role === "technician" && currentStep !== "work" ? (
              <Button onClick={handleNext} disabled={isLoading || isUpdating}>
                Continuar
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading || isUpdating}>
                {isLoading || isUpdating ? "Guardando..." : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 