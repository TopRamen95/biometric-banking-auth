"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-text", { opacity: 0, y: 50, duration: 1, stagger: 0.2 });
            // Apply a fade-in effect to both buttons
            gsap.fromTo(
                ".cta-btn",
                { opacity: 0 },
                { opacity: 1, duration: 1, delay: 0.5 }
            );
            gsap.fromTo(
                ".biometric-btn",
                { opacity: 0 },
                { opacity: 1, duration: 1, delay: 0.7 }
            );
        });

        return () => ctx.revert();
    }, [router.pathname]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);

        try {
            // Send login request to the backend API
            const response = await fetch("http://127.0.0.1:8000/auth/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save token in localStorage
                localStorage.setItem("authToken", data.token);
                router.push("/Dashboard");
            } else {
                setError(data.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div key={router.pathname} className="relative w-full h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Navbar */}
            <nav className="absolute top-0 w-full flex justify-between items-center p-6 px-10 bg-white/10 backdrop-blur-md shadow-lg">
                <div className="text-2xl font-bold tracking-wide cursor-pointer" onClick={() => router.push("/")}>
                    🏦 MyBank
                </div>
                <button onClick={() => router.push("/register")} className="px-6 py-2 bg-white text-[#D74E26] font-medium rounded-lg shadow-md hover:bg-gray-200 transition">
                    Register
                </button>
            </nav>

            {/* Hero Section */}
            <div className="mt-20 text-center">
                <h1 className="hero-text text-5xl font-bold drop-shadow-lg">Login to Your Account</h1>
            </div>

            {/* Login Form */}
            <div className="mt-10 w-96 p-6 bg-white/20 rounded-xl shadow-md backdrop-blur-md">
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-lg font-medium text-white">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border border-white focus:outline-none"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-white">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border border-white focus:outline-none"
                        />
                    </div>
                    {error && <p className="text-white text-sm">{error}</p>}
                    <button type="submit" className="cta-btn w-full px-6 py-3 bg-white text-[#D74E26] font-semibold rounded-lg shadow-lg" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Biometric Login */}
                <button className="biometric-btn mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition" onClick={() => router.push("/biometric_login")}>
                    Login using Biometric
                </button>
            </div>
        </div>
    );
}
8