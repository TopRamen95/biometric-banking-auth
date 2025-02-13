"use client";
import { useState } from "react";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const requestOTP = async () => {
    const response = await fetch("http://127.0.0.1:8000/request-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setMessage(data.message || "OTP Sent!");
  };

  const verifyOTP = async () => {
    const response = await fetch("http://127.0.0.1:8000/verify-otp/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });

    const data = await response.json();
    setMessage(data.message || "OTP Verified!");
  };

  return (
    <div style={containerStyle}>
      <h2>OTP Authentication</h2>
      <button onClick={requestOTP}>Request OTP</button>
      <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOTP}>Verify OTP</button>
      <p>{message}</p>
    </div>
  );
}

const containerStyle = { textAlign: "center", padding: "20px" };
