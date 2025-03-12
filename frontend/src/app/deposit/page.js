"use client";
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Deposit() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [amount, setAmount] = useState("");
  const [chatboxOpen, setChatboxOpen] = useState(false); // State for chatbox open/close
  const [greeting, setGreeting] = useState(true); // State for greeting message

  useEffect(() => {
    if (typeof window !== "undefined" && window.SpeechRecognition) {
      const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new speechRecognition();
      recognitionInstance.lang = 'en-US';
      recognitionInstance.continuous = true;

      recognitionInstance.onresult = (event) => {
        const lastResult = event.results[event.resultIndex];
        const spokenText = lastResult[0].transcript;
        setTranscript(spokenText);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn("Speech Recognition is not supported in this browser.");
    }

    gsap.from(".deposit-title", { opacity: 0, y: 50, duration: 1 });
    gsap.from(".deposit-form", { opacity: 0, scale: 0.8, duration: 1, delay: 0.5 });
  }, []);

  const handleStartListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    } else {
      alert("Speech recognition is not available on your browser.");
    }
  };

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleVoiceCommand = () => {
    if (transcript.toLowerCase().includes("dashboard")) {
      router.push("/dashboard");
    } else if (transcript.toLowerCase().includes("transactions")) {
      router.push("/transactions");
    } else if (transcript.toLowerCase().includes("support")) {
      router.push("/support");
    } else if (transcript.toLowerCase().includes("logout")) {
      router.push("/login");
    } else if (transcript.toLowerCase().includes("deposit")) {
      setAmount(parseFloat(transcript.match(/\d+/)?.[0] || ""));
    } else {
      console.log("Command not recognized");
    }
  };

  const toggleChatbox = () => {
    setChatboxOpen(!chatboxOpen);
    setGreeting(false); // Hide greeting once the chatbox is opened
  };

  const handleDeposit = () => {
    if (amount <= 0) {
      alert("Please enter a valid deposit amount.");
    } else {
      alert(`Successfully deposited $${amount}`);
      setAmount("");
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] text-white">
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
      <div className="ml-64 p-10">
        <div className="deposit-title text-4xl font-bold mb-10">Deposit Funds</div>

        {/* Deposit Form */}
        <div className="deposit-form bg-white/20 p-6 rounded-xl shadow-md backdrop-blur-md">
          <h3 className="text-xl font-bold">Enter Deposit Amount</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="mt-4 p-3 w-full bg-transparent border-2 border-white rounded-lg text-lg"
          />
          <button
            onClick={handleDeposit}
            className="mt-6 w-full bg-[#D74E26] text-white py-3 rounded-lg text-lg"
          >
            Deposit
          </button>
        </div>
      </div>

      {/* Floating Chatbot Icon */}
      <div
        onClick={toggleChatbox}
        className="fixed bottom-6 right-6 bg-[#D74E26] p-4 rounded-full cursor-pointer shadow-lg text-white flex justify-center items-center"
      >
        <span className="text-2xl">💬</span>
      </div>

      {/* Chatbox */}
      {chatboxOpen && (
        <div className="fixed bottom-24 right-6 bg-white text-[#D74E26] p-6 w-72 h-80 rounded-xl shadow-lg z-50">
          <div className="text-lg font-bold mb-4">
            {greeting ? "Hello! How can I assist you today?" : "Please say your command."}
          </div>
          {!greeting && (
            <>
              <button
                onClick={handleStartListening}
                className="w-full bg-[#D74E26] text-white p-2 rounded-lg mb-4"
              >
                Start Listening
              </button>
              <button
                onClick={handleStopListening}
                className="w-full bg-gray-500 text-white p-2 rounded-lg"
              >
                Stop Listening
              </button>
            </>
          )}
          {transcript && !greeting && <p className="mt-4">You said: {transcript}</p>}
        </div>
      )}
    </div>
  );
}
