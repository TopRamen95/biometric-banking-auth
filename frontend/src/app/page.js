"use client";

import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [faceData, setFaceData] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [message, setMessage] = useState("");

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

    const response = await fetch("http://127.0.0.1:8000/auth/biometric-register/", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      setMessage("Upload successful!");
    } else {
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Your Data</h1>
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
        <input
          type="file"
          onChange={(e) => setFaceData(e.target.files[0])}
          className="block w-full p-2 border rounded"
          required
        />
        <input
          type="file"
          onChange={(e) => setVoiceData(e.target.files[0])}
          className="block w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}