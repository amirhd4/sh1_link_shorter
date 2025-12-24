"use client";

import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientProtectedLayout({ children }: any) {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
  if (!isLoading) {
    if (!user) {
      router.replace("/login");
    } else if (user.role === "admin") {
      // router.replace("/admin/dashboard");
    } else {
      router.replace("/dashboard");
    }
  }
}, [user, isLoading]);


  if (isLoading) return null;

  return <>{children}</>;
}