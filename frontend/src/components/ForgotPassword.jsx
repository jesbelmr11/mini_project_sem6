import React, { useState } from "react";

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
    <div className="form-box Login">
      <h2>Forgot Password</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={sendOtp}>
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form onSubmit={resetPassword}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      )}

      {msg && (
        <p style={{ color: msg.type === "error" ? "red" : "lightgreen" }}>
          {msg.text}
        </p>
      )}

      <p>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
          Back to Login
        </a>
      </p>
    </div>
  );
}
