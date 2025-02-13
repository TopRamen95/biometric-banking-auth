"use client";
import { useEffect, useState } from "react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/transactions/list/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setTransactions(data);
      } else {
        alert(data.detail || "Failed to fetch transactions.");
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div style={containerStyle}>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            <strong>Amount:</strong> {tx.amount} | <strong>Type:</strong> {tx.type}
          </li>
        ))}
      </ul>
    </div>
  );
}

const containerStyle = { textAlign: "center", padding: "20px" };
