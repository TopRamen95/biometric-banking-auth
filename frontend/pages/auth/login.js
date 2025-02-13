"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in user:", { username, password });

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);

      // Assuming the backend returns a token on successful login
      if (result.token) {
        localStorage.setItem("token", result.token); // Store token in local storage
        router.push("/dashboard"); // Redirect to dashboard after login
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Switch to Biometric Login */}
      <button onClick={() => router.push("/auth/login-bio")}>Login using Biometrics</button>

      {/* Navigate to Register */}
      <p>
        Don't have an account?{" "}
        <span
          onClick={() => router.push("/auth/register")}
          style={{ cursor: "pointer", color: "blue" }}
        >
          Register
        </span>
      </p>
    </div>
  );
}
