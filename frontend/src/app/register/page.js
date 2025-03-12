"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function Register() {
    const router = useRouter();

    // State variables for form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [email, setEmail] = useState('');

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

    // Handle registration form submission
    const handleRegister = async (e) => {
        e.preventDefault();

        const data = { username, password, phone_no: phoneNo, email };

        // Call the backend API for registration (assuming endpoint `/api/register`)
        const response = await fetch('http://127.0.0.1:8000/auth/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            router.push("/Dashboard"); // Redirect to the dashboard after successful registration
        } else {
            const error = await response.json();
            alert(error.message || "Something went wrong!");
        }
    };

    return (
        <div key={router.pathname} className="relative w-full h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] flex flex-col items-center justify-center text-white overflow-hidden">
            {/* Navbar */}
            <nav className="absolute top-0 w-full flex justify-between items-center p-6 px-10 bg-white/10 backdrop-blur-md shadow-lg">
                <div
                    className="text-2xl font-bold tracking-wide cursor-pointer"
                    onClick={() => {
                        window.location.href = "/"; // ✅ Redirects to Home Page
                    }}
                >
                    🏦 MyBank
                </div>

                <div className="flex space-x-4">
                    <button onClick={() => router.push("/login")} className="px-6 py-2 bg-white text-[#D74E26] font-medium rounded-lg shadow-md hover:bg-gray-200 transition">Login</button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="mt-20 text-center">
                <h1 className="hero-text text-5xl font-bold drop-shadow-lg">Create a New Account</h1>
            </div>

            {/* Register Form */}
            <div className="mt-10 w-96 p-6 bg-white/20 rounded-xl shadow-md backdrop-blur-md">
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-lg font-medium text-white">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border-1 border-white focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-lg font-medium text-white">Phone Number</label>
                        <input
                            type="text"
                            value={phoneNo}
                            onChange={(e) => setPhoneNo(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border-1 border-white focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-white">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border-1 border-white focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-lg font-medium text-white">Email (Optional)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 text-white rounded-lg border-1 border-white focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="cta-btn w-full px-6 py-3 bg-white text-[#D74E26] font-semibold rounded-lg shadow-lg hover:bg-amber-100 transition"
                    >
                        Register
                    </button>
                </form>

                {/* Biometric Register Button */}
                <button
                    className="biometric-btn mt-4 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
                    onClick={() => router.push("/biometric_register")}
                >
                    Register using Biometric
                </button>
            </div>
        </div>
    );
}
