"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/lib/categories/actions";
import type { Category } from "@/lib/categories/actions";
import { useToast } from "@/hooks/use-toast";

interface WorkInfoFormProps {
  onChange: (field: string, value: string | number) => void;
  values?: Record<string, any>;
  validateWorkInfo: () => boolean;
  errors?: Record<string, string>;
}

export function WorkInfoForm({
  onChange,
  values = {},
  validateWorkInfo,
  errors = {},
}: WorkInfoFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            "No se pudieron cargar las categorías. Por favor intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const accountTypes = [
    { value: "ahorro", label: "Cuenta de Ahorro" },
    { value: "corriente", label: "Cuenta Corriente" },
  ];

  const handleFieldChange = (field: string, value: any) => {
    onChange(field, value);
    setTimeout(() => validateWorkInfo(), 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Áreas de Trabajo *</Label>
        {errors?.areaTrabajo && (
          <p className="text-sm text-red-500">{errors.areaTrabajo}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={values.areaTrabajo?.includes(category.id) || false}
                onChange={(e) => {
                  const newAreas = e.target.checked
                    ? [...(values.areaTrabajo || []), category.id]
                    : (values.areaTrabajo || []).filter(
                        (id: string) => id !== category.id
                      );
                  handleFieldChange("areaTrabajo", newAreas);
                }}
              />
              <Label htmlFor={`category-${category.id}`} className="ml-2">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="anosExperiencia">Años de Experiencia</Label>
        {errors?.anosExperiencia && (
          <p className="text-sm text-red-500">{errors.anosExperiencia}</p>
        )}
        <Input
          id="anosExperiencia"
          type="number"
          min="0"
          placeholder="5"
          value={values.anosExperiencia || ""}
          onChange={(e) =>
            handleFieldChange("anosExperiencia", parseInt(e.target.value, 10))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombreBanco">Nombre del Banco</Label>
        {errors?.nombreBanco && (
          <p className="text-sm text-red-500">{errors.nombreBanco}</p>
        )}
        <Input
          id="nombreBanco"
          placeholder="Banco Nacional"
          value={values.nombreBanco || ""}
          onChange={(e) => handleFieldChange("nombreBanco", e.target.value)}
          required={false}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numeroCuenta">Número de Cuenta</Label>
        {errors?.numeroCuenta && (
          <p className="text-sm text-red-500">{errors.numeroCuenta}</p>
        )}
        <Input
          id="numeroCuenta"
          placeholder="1234567890"
          type="number"
          value={values.numeroCuenta || ""}
          onChange={(e) => handleFieldChange("numeroCuenta", e.target.value)}
          required={false}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipoCuenta">Tipo de Cuenta</Label>
        {errors?.tipoCuenta && (
          <p className="text-sm text-red-500">{errors.tipoCuenta}</p>
        )}
        <Select
          onValueChange={(value) => handleFieldChange("tipoCuenta", value)}
          defaultValue={values.tipoCuenta}
          required={false}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo de cuenta" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
