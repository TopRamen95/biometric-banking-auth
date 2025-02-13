"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/register"); // Redirect to Register Page
  }, []);

  return <div>Redirecting...</div>;
}
