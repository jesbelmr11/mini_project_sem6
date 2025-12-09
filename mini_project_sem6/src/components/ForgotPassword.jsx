import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ OTP sent successfully! Check your inbox.");
      } else {
        setMessage("❌ Error sending OTP: " + data.message);
      }
    } catch (error) {
      setMessage("❌ Failed to send OTP. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <h2 style={{ color: "white", marginBottom: "20px" }}>Forgot Password</h2>
      <form onSubmit={handleSendOTP} style={{ width: "320px" }}>
        <div className="input-box">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      {message && (
        <p style={{ color: "#fff", marginTop: "15px", textAlign: "center" }}>{message}</p>
      )}

      <p style={{ marginTop: "20px" }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          ← Back to Login
        </a>
      </p>
    </div>
  );
}
