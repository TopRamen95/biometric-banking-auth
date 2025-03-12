"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [buttonVisible, setButtonVisible] = useState(false); // Added state to track button visibility

  useEffect(() => {
    // GSAP animations for text and features
    gsap.from(".hero-text", { opacity: 0, y: 50, duration: 1, stagger: 0.2 });
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.2,
      delay: 1,
    });

    // Trigger the visibility of the "Get Started" button after animation
    gsap.from(".cta-btn", { opacity: 0, scale: 0.8, duration: 1, delay: 0.5, onComplete: () => setButtonVisible(true) }); // Ensures button appears after animation
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] flex flex-col items-center justify-center text-white overflow-hidden">
      
      {/* Navbar */}
      <nav className="absolute top-0 w-full flex justify-between items-center p-6 px-10 bg-white/10 backdrop-blur-md shadow-lg">
        <div
          className="text-2xl font-bold tracking-wide cursor-pointer"
          onClick={() => {
            window.location.href = "/"; // Redirects to Home Page
          }}
        >
          🏦 MyBank
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-gray-200 transition">Features</a>
          <a href="#" className="hover:text-gray-200 transition">About Us</a>
          <a href="#" className="hover:text-gray-200 transition">Support</a>
        </div>
        <div className="flex space-x-4">
          <button onClick={() => router.push("/login")} className="px-6 py-2 bg-white text-[#D74E26] font-medium rounded-lg shadow-md hover:bg-gray-200 transition">
            Login
          </button>
          <button onClick={() => router.push("/register")} className="px-6 py-2 bg-white text-[#D74E26] font-medium rounded-lg shadow-md hover:bg-gray-200 transition">
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mt-32 text-center">
        <h1 className="hero-text text-5xl font-bold drop-shadow-lg">
          Banking Made Simple.
        </h1>
        <p className="hero-text mt-4 text-lg opacity-80">
          Manage your finances effortlessly with our secure and modern banking platform.
        </p>
        {/* Conditional rendering for button visibility */}
        {buttonVisible && (
          <button onClick={() => router.push("/register")} className="cta-btn mt-10 px-6 py-3 bg-white text-[#D74E26] font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition relative z-10">
            Get Started
          </button>
        )}
      </div>

      {/* Features Section */}
      <div className="absolute bottom-10 flex space-x-6">
        <div className="feature-card bg-white/20 p-6 rounded-xl shadow-md backdrop-blur-md">
          <h3 className="text-xl font-bold">📊 Track Expenses</h3>
          <p className="text-sm opacity-80 mt-2">View insights and analytics for better financial decisions.</p>
        </div>
        <div className="feature-card bg-white/20 p-6 rounded-xl shadow-md backdrop-blur-md">
          <h3 className="text-xl font-bold">🔐 Secure Transfers</h3>
          <p className="text-sm opacity-80 mt-2">Send and receive money safely with top-notch security.</p>
        </div>
        <div className="feature-card bg-white/20 p-6 rounded-xl shadow-md backdrop-blur-md">
          <h3 className="text-xl font-bold">💳 Smart Cards</h3>
          <p className="text-sm opacity-80 mt-2">Get virtual & physical cards with real-time tracking.</p>
        </div>
      </div>
    </div>
  );
}
