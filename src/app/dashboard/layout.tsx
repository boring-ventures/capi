"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const userData = localStorage.getItem("user_data");
      const accessToken = localStorage.getItem("access_token");

      if (!userData || !accessToken) {
        router.push("/");
        return;
      }

      // const {
      //   data: { user },
      // } = await supabase.auth.getUser();

      // if (!user) {
      //   localStorage.removeItem("user_data");
      //   localStorage.removeItem("access_token");
      //   router.push("/");
      // }
    };

    checkUser();
  }, [router]);

  return <div>{children}</div>;
}
