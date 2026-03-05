"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function HomePage() {
  usePageTitle("Home");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "customer") {
        router.push("/customer/requests");
      } else if (user.role === "therapist") {
        router.push("/therapist/requests");
      } else if (user.role === "admin" || user.role === "sub_admin") {
        router.push("/admin/dashboard");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div>Loading...</div>;
}