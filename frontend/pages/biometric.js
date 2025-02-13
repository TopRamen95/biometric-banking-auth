"use client";
import { useState } from "react";

export default function BiometricAuth() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadBiometric = async (url) => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setMessage(data.message || "Upload successful!");
  };

  return (
    <div style={containerStyle}>
      <h2>Biometric Authentication</h2>
      <input type="file" onChange={handleFileUpload} />
      <button onClick={() => uploadBiometric("http://127.0.0.1:8000/upload-face/")}>Upload Face</button>
      <button onClick={() => uploadBiometric("http://127.0.0.1:8000/upload-voice/")}>Upload Voice</button>
      <p>{message}</p>
    </div>
  );
}

const containerStyle = { textAlign: "center", padding: "20px" };
