import { z } from "zod";
import { loginSchema } from "@/lib/validations/auth";

export type LoginFormData = z.infer<typeof loginSchema>; 