"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        alert(data.detail || "Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Profile</h2>
      {user ? (
        <div>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Joined:</strong> {user.date_joined}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

const containerStyle = { textAlign: "center", padding: "20px" };
