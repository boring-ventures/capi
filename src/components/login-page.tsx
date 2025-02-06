"use client";

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5EBE8]">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-md">
            <Image
              src="/images/capi.png"
              alt="CAPI Logo"
              width={120}
              height={120}
              className="text-primary-foreground"
            />
          </div>
          <span className="text-2xl font-hanson">CAPI</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
