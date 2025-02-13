// services/api.js

const BASE_URL = "http://127.0.0.1:8000/api/auth"; // Change this if your backend is running on a different port

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
