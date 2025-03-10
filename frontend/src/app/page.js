"use client";

import { useState, useRef, useEffect } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [faceData, setFaceData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [voiceFileError, setVoiceFileError] = useState(""); // To track voice file errors

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  // Capture Image from Webcam
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

          // Display captured image
          setCapturedImage(URL.createObjectURL(blob));
        }
      }, "image/jpeg");
    }
  };

  // Start Recording Audio
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
      setVoiceFileError(""); // Reset any previous errors
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // Stop Recording Audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Upload to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !phoneNo || !faceData || !voiceData) {
      setMessage("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("phone_no", phoneNo);
    formData.append("face_data", faceData); // Face data file
    formData.append("voice_data", voiceData); // Audio file

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/biometric-register/", {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();
      if (response.ok) {
        setMessage("Upload successful!");
      } else {
        setMessage(`Upload failed: ${responseData.error || "Check console for details"}`);
      }
    } catch (error) {
      setMessage("An error occurred. Check console for details.");
      console.error("Fetch Error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Your Biometric Data</h1>

      {/* Webcam Preview */}
      <div className="flex flex-col items-center mb-4">
        <video ref={videoRef} autoPlay className="w-64 h-48 border rounded mb-2" />
        <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
      </div>

      {/* Captured Image Preview */}
      {capturedImage && (
        <img src={capturedImage} alt="Captured Face" className="w-64 h-48 border rounded mb-2" />
      )}

      {/* Voice Recording Preview */}
      {voiceData && (
        <p className="mb-4">Voice recording ready to upload: {voiceData.name}</p>
      )}

      {voiceFileError && <p className="text-red-500">{voiceFileError}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="block w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNo}
          onChange={(e) => setPhoneNo(e.target.value)}
          className="block w-full p-2 border rounded"
          required
        />

        {/* Capture Image & Record Voice */}
        <button type="button" onClick={captureImage} className="bg-green-500 text-white px-4 py-2 rounded">
          Capture Face
        </button>

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded ${recording ? "bg-red-500" : "bg-blue-500"} text-white`}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
