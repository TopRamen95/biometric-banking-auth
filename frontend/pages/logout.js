import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    router.push("/login");
  }, []);

  return <h2>Logging out...</h2>;
}
