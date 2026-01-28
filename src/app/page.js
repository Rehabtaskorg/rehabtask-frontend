"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
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
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div>Loading...</div>;
}