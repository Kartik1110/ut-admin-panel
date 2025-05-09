// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); 
    if (token) {
      router.replace("/listings"); 
    } else {
      router.replace("/login"); 
    }
  }, []);

  return null; 
}
