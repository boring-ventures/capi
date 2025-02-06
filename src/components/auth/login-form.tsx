"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/utils/supabaseClient";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginFormData } from "@/types/auth";

export function LoginForm() {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setMessage(null);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      const { session, user } = authData;
      if (session) {
        localStorage.setItem("user_data", JSON.stringify(user));
        localStorage.setItem("access_token", session.access_token);
      }
      
      setMessage("¡Inicio de sesión exitoso!");
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al iniciar sesión");
    }
  };

  const handlePasswordReset = async () => {
    setMessage(null);
    setIsResettingPassword(true);

    try {
      const email = getValues("email");
      if (!email) {
        throw new Error("Por favor ingresa tu correo electrónico");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setMessage(
        "Correo de restablecimiento de contraseña enviado. Por favor revisa tu bandeja de entrada."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error al restablecer contraseña");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">
          Panel Administrativo
        </CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@capi.com"
              className="border-0 bg-muted shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              className="border-0 bg-muted shadow-[inset_0_1px_4px_rgba(0,0,0,0.1)] focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {message && (
            <Alert variant={message.includes("Error") ? "destructive" : "default"} className="border-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full">
            {errors.root?.serverError ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button
          onClick={handlePasswordReset}
          variant="ghost"
          className="text-sm hover:text-primary"
          disabled={isResettingPassword}
        >
          {isResettingPassword ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "¿Olvidaste tu contraseña?"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 