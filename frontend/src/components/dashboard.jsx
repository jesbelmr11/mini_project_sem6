import React from "react";
import "../styles/style.css";

export default function Dashboard({ user, onLogout }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#1f1f23",
      color: "#fff",
      padding: 20
    }}>
      <div style={{
        background: "#2a2a31",
        padding: 28,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        textAlign: "center",
        maxWidth: 600,
        width: "100%"
      }}>
        <h1 style={{ marginBottom: 8 }}>Hello, {user?.name || "User"} 👋</h1>
        <p style={{ marginBottom: 20 }}>You are logged in as {user?.email}</p>
        <button
          className="btn"
          onClick={() => {
            if (typeof onLogout === "function") onLogout();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
