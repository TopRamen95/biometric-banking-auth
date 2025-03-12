"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

export default function Transactions() {
    const router = useRouter();
    const [transactions, setTransactions] = useState([
        { date: "2025-03-12", description: "Deposit", amount: 1000 },
        { date: "2025-03-10", description: "Payment", amount: -50 },
        { date: "2025-03-09", description: "Transfer", amount: -200 },
    ]);

    // GSAP animation for page load
    useEffect(() => {
        gsap.from(".transaction-card", {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.2,
        });
    }, []);

    const handleNavigation = (path) => {
        router.push(path);
        // Optional: To force a reload, you can use `window.location.reload()` after navigating
        window.location.reload();
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] text-white">
            {/* Sidebar */}
            <div className="w-64 bg-[#B6411A] h-full p-6 fixed left-0 top-0 shadow-lg">
                <div className="text-2xl font-bold tracking-wide text-white">
                    🏦 MyBank
                </div>
                <nav className="mt-10">
                    <button onClick={() => router.push("/transactions")} className="block py-2 text-white hover:text-gray-300">Transactions</button>
                    <button onClick={() => router.push("/support")} className="block py-2 text-white hover:text-gray-300">Support</button>
                    <button onClick={() => router.push("/login")} className="block py-2 text-white hover:text-gray-300 mt-4">
                        Logout
                    </button>
                </nav>
            </div>


            {/* Main Content */}
            <div className="ml-[250px] p-6 w-full">
                <div className="text-4xl font-bold mb-10">Transactions</div>

                {/* Transaction Cards */}
                <div>
                    {transactions.map((transaction, index) => (
                        <div
                            key={index}
                            className="transaction-card bg-white/20 p-6 rounded-xl shadow-xl backdrop-blur-md mb-6"
                        >
                            <div className="flex justify-between">
                                <p>{transaction.description}</p>
                                <p
                                    className={`${transaction.amount < 0 ? "text-red-500" : "text-green-500"
                                        }`}
                                >
                                    ${transaction.amount}
                                </p>
                            </div>
                            <p>{transaction.date}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Chatbot Icon */}
            <div
                onClick={() => handleNavigation("/support")}
                className="fixed bottom-8 right-8 bg-[#D74E26] p-4 rounded-full text-white cursor-pointer shadow-lg"
            >
                💬
            </div>
        </div>
    );
}
