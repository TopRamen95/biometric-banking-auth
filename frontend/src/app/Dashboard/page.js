"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa"; // Arrow icons for toggle

export default function Dashboard() {
    const router = useRouter();
    const [balance, setBalance] = useState(5000);
    const [transactions, setTransactions] = useState([
        { date: "2025-03-12", description: "Deposit", amount: 1000 },
        { date: "2025-03-10", description: "Payment", amount: -50 },
        { date: "2025-03-09", description: "Transfer", amount: -200 },
    ]);
    const [timeLeft, setTimeLeft] = useState(900);
    const [accessToken, setAccessToken] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
    const [isAdmin, setIsAdmin] = useState(false); // Track if user is admin
    const [isSuperUser, setIsSuperUser] = useState(false); // Track if user is superuser
    const [currentTime, setCurrentTime] = useState(null); // Store current time (initially null)

    useEffect(() => {
        // Fetch the access token (you might store it in cookies or localStorage)
        const token = localStorage.getItem("accessToken");
        if (token) {
            setAccessToken(token);
        }

        // Handle page back button behavior (if the user presses back, log them out)
        const handlePopState = () => {
            handleLogout();
        };

        window.addEventListener("popstate", handlePopState);

        // Initial GSAP animations
        gsap.from(".dashboard-title", { opacity: 0, y: 50, duration: 1 });
        gsap.from(".balance-card", { opacity: 0, scale: 0.8, duration: 1, delay: 0.5 });
        gsap.from(".transaction-card", {
            opacity: 0,
            y: 30,
            duration: 1,
            stagger: 0.2,
            delay: 1,
        });

        // Fetch user role from access token or make a request to the backend
        const userRole = JSON.parse(localStorage.getItem("userRole"));
        if (userRole && userRole.isAdmin) {
            setIsAdmin(true);
        }
        if (userRole && userRole.isSuperUser) {
            setIsSuperUser(true);
        }

        // Fetch user data from the backend if token exists
        if (accessToken) {
            fetchUserData();
        }

        // If user is not admin or superuser, start the timer
        if (!isAdmin && !isSuperUser) {
            const savedTime = localStorage.getItem("timeLeft");
            if (savedTime) {
                setTimeLeft(parseInt(savedTime));
            }

            const interval = setInterval(() => {
                setTimeLeft((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0) {
                        clearInterval(interval);
                        handleLogout();
                        return 0;
                    }
                    localStorage.setItem("timeLeft", newTime);
                    return newTime;
                });
            }, 1000);

            return () => {
                clearInterval(interval);
                window.removeEventListener("popstate", handlePopState);
            };
        }

        // Update the current time every second on the client side (client-side only)
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date().toLocaleString());
        }, 1000);

        return () => clearInterval(timeInterval); // Clear the interval when component unmounts
    }, [accessToken, isAdmin, isSuperUser]);

    const fetchUserData = async () => {
        try {
            const response = await fetch("/api/user-dashboard", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            setBalance(data.balance);
            setTransactions(data.transactions);
        } catch (error) {
            console.error("Error fetching user data:", error);
            handleLogout();
        }
    };

    const handleLogout = () => {
        setAccessToken('');
        setTimeLeft(0);
        localStorage.removeItem("timeLeft");
        localStorage.removeItem("userRole");
        localStorage.removeItem("accessToken");
        router.push("/login");
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full min-h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] text-white flex">
            {/* Toggle Button (Left Middle) */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-50 bg-[#B6411A] p-2 rounded-full shadow-lg text-white"
            >
                {isSidebarOpen ? <FaArrowLeft size={20} /> : <FaArrowRight size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full bg-[#B6411A] p-6 shadow-lg transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="text-2xl font-bold tracking-wide text-white">
                    🏦 MyBank
                </div>
                <nav className="mt-10">
                    <button onClick={() => router.push("/transactions")} className="block py-2 text-white hover:text-gray-300">Transactions</button>
                    <button onClick={() => router.push("/support")} className="block py-2 text-white hover:text-gray-300">Support</button>
                    <button onClick={handleLogout} className="block py-2 text-white hover:text-gray-300 mt-4">
                        Logout
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-10 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <div className="dashboard-title text-4xl font-bold mb-10">Dashboard</div>

                {/* Account Overview */}
                <div className="balance-card bg-white/20 p-6 rounded-xl shadow-md backdrop-blur-md">
                    <h3 className="text-xl font-bold">Account Balance</h3>
                    <p className="text-4xl mt-4">${balance}</p>
                </div>

                {/* Quick Actions */}
                <div className="mt-10 flex space-x-6">
                    <button onClick={() => router.push("/transfer")} className="w-1/3 bg-white text-[#D74E26] p-4 rounded-xl shadow-md hover:bg-gray-200 transition">
                        Transfer Money
                    </button>
                    <button onClick={() => router.push("/deposit")} className="w-1/3 bg-white text-[#D74E26] p-4 rounded-xl shadow-md hover:bg-gray-200 transition">
                        Deposit Funds
                    </button>
                    <button onClick={() => router.push("/support")} className="w-1/3 bg-white text-[#D74E26] p-4 rounded-xl shadow-md hover:bg-gray-200 transition">
                        Request Support
                    </button>
                </div>

                {/* Recent Transactions */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold">Recent Transactions</h3>
                    <div className="mt-4 space-y-4">
                        {transactions.map((transaction, index) => (
                            <div key={index} className="transaction-card p-4 bg-white/20 rounded-lg shadow-md backdrop-blur-md">
                                <div className="flex justify-between">
                                    <p className="text-lg font-semibold">{transaction.description}</p>
                                    <p className={`text-lg font-semibold ${transaction.amount < 0 ? "text-red-500" : "text-green-500"}`}>
                                        ${transaction.amount}
                                    </p>
                                </div>
                                <p className="text-sm opacity-80">{transaction.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timer and Current Time Display */}
            {!isAdmin && !isSuperUser && currentTime && (
                <div className="absolute right-4 text-xs text-white">
                    <div>Time Left: {formatTime(timeLeft)}</div>
                    <div>{currentTime}</div> {/* Dynamic current time */}
                </div>
            )}
        </div>
    );
}
