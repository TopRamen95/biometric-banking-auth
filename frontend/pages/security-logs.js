"use client";
import { useEffect, useState } from "react";

export default function SecurityLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/security-logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setLogs(data);
      } else {
        alert(data.detail || "Failed to fetch security logs.");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Security Logs</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>Action:</strong> {log.action} | <strong>Date:</strong> {log.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

const containerStyle = { textAlign: "center", padding: "20px" };
