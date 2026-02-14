import React, { useState } from "react";
import "../styles/style.css";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- Send OTP ----------------
  async function sendOtp(e) {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: "OTP sent to your email" });
        setStep(2);
      }
    } catch {
      setMsg({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Verify OTP ----------------
  async function verifyOtp(e) {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: "OTP verified" });
        setStep(3);
      }
    } catch {
      setMsg({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  }

  // ---------------- Reset Password ----------------
  async function resetPassword(e) {
    e.preventDefault();
    setMsg(null);

    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otp,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: "Password reset successful" });

        setTimeout(() => {
          if (typeof onBack === "function") onBack();
        }, 1500);
      }
    } catch {
      setMsg({ type: "error", text: "Server error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {/* White Shapes */}
      <div className="curved-shape"></div>
      <div className="curved-shape2"></div>

      {/* Form Section */}
      <div className="form-box Login">
        <h2>Forgot Password</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp}>
            <div className="input-box">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Email</label>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={verifyOtp}>
            <div className="input-box">
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <label>Enter OTP</label>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={resetPassword}>
            <div className="input-box">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label>New Password</label>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {msg && (
          <p style={{ color: msg.type === "error" ? "red" : "lightgreen", marginTop: 15 }}>
            {msg.text}
          </p>
        )}

        <div className="regi-link">
          <p>
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              ← Back to Login
            </button>
          </p>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <div className="info-content Login">
        <h2>Password Recovery</h2>
        <p>
          Enter your registered email address to receive a One-Time Password.
          Verify the OTP and set a new secure password for your account.
        </p>
      </div>
    </div>
  );
}
