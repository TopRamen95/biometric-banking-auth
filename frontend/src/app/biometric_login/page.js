"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation"; // Import the useRouter hook properly

export default function BiometricLogin() {
  const [username, setUsername] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [faceData, setFaceData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [voiceFileError, setVoiceFileError] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const formRef = useRef(null);

  // Initialize router hook
  const router = useRouter();

  // Start Webcam when Component Mounts
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };
    startWebcam();
  }, []);

  useEffect(() => {
    gsap.from(formRef.current, {
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: "power4.out",
    });
  }, []);

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "face_capture.jpeg", { type: "image/jpeg" });
          setFaceData(file);
          setCapturedImage(URL.createObjectURL(blob));
        }
      }, "image/jpeg");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioFile = new File([audioBlob], "voice_recording.wav", { type: "audio/wav" });
      setVoiceData(audioFile);
      setVoiceFileError("");
    };

    mediaRecorderRef.current.start();
    setRecording(true);

    // Automatically stop recording after 5 seconds
    setTimeout(() => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    }, 5000); // 5000 milliseconds = 5 seconds
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !phoneNo || !faceData || !voiceData) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("phone_no", phoneNo);
    formData.append("face_data", faceData);
    formData.append("voice_data", voiceData);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/biometric-login/", {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();

      if (response.ok) {
        setMessage("Biometric authentication successful!");
        // Redirect to dashboard upon successful login
        router.push("/Dashboard"); // Ensure the dashboard route is correct
      } else {
        setMessage(`Authentication failed: ${responseData.error || "Check console for details"}`);
      }
    } catch (error) {
      setMessage("An error occurred. Check console for details.");
      console.error("Fetch Error:", error);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#D74E26] via-[#ff7043] to-[#B6411A] flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 w-full flex justify-between items-center p-6 px-10 bg-white/10 backdrop-blur-md shadow-lg">
        <div
          className="text-2xl font-bold tracking-wide cursor-pointer"
          onClick={() => {
            window.location.href = "/"; // ✅ Redirects to Home Page
            // window.location.reload();   // ✅ Forces a Full Page Reload
          }}
        >
          🏦 MyBank
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

      {/* Login Section */}
      <div className="max-w-md w-full bg-white/20 p-8 rounded-lg shadow-lg backdrop-blur-md mt-32 overflow-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">Biometric Login</h1>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 ">
          <div className="flex flex-col items-center mb-6">
            <video ref={videoRef} autoPlay className="w-64 h-48 border-2 border-white rounded mb-2" />
            <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
          </div>

          {capturedImage && (
            <div className="flex flex-col items-center mb-6">
              <img src={capturedImage} alt="Captured Face" className="w-64 h-48 border-2 border-white rounded" />
            </div>
          )}

          {voiceData && <p className="text-white text-center mb-4">Voice recording ready: {voiceData.name}</p>}
          {voiceFileError && <p className="text-red-500 text-center">{voiceFileError}</p>}

          <div className="mb-6">
            <label className="block text-lg font-medium text-white">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-gray-800 rounded-lg bg-opacity-50 bg-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium text-white">Phone Number</label>
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full px-4 py-2 text-gray-800 rounded-lg bg-opacity-50 bg-white"
            />
          </div>

          <div className="flex justify-between mb-4">
            <button
              type="button"
              onClick={captureImage}
              className="px-6 py-2 rounded-md bg-white text-[#D74E26] font-semibold shadow-lg hover:bg-blue-600 hover:text-white transition"
            >
              Capture Face
            </button>

            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`px-6 py-2 rounded-md bg-white text-[#D74E26] font-semibold shadow-lg hover:bg-blue-600 hover:text-white transition ${recording ? "bg-red-500" : ""}`}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </button>
          </div>

          <button type="submit" className="w-full px-6 py-3 bg-white text-[#D74E26] font-semibold rounded-lg shadow-lg hover:bg-green-500 hover:text-white transition">
            Login
          </button>

          {message && <p className="text-center mt-4 text-red-500">{message}</p>}
        </form>
      </div>
    </div>
  );
}
