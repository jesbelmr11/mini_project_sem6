import React, { useState } from "react";

export default function Login({ setActive }) {
  const [login, setLogin] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setLogin({ ...login, [e.target.name]: e.target.value });
  }

  async function submitLogin(e) {
    e.preventDefault();
    setMsg(null);

    if (!login.email || !login.password) {
      return setMsg({ type: "error", text: "Enter email and password" });
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });

      const data = await res.json();
      if (!res.ok) setMsg({ type: "error", text: data.error });
      else setMsg({ type: "success", text: "Login successful!" });
    } catch {
      setMsg({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="form-box Login">
        <h2 className="animation" style={{ "--S": 1 }}>Login</h2>

        <form onSubmit={submitLogin}>
          <div className="input-box animation" style={{ "--S": 2 }}>
            <input
              type="email"
              name="email"
              required
              placeholder=" "
              value={login.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-box animation" style={{ "--S": 3 }}>
            <input
              type="password"
              name="password"
              required
              placeholder=" "
              value={login.password}
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <div className="input-box animation" style={{ "--S": 4 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <div className="regi-link animation" style={{ "--S": 5 }}>
            <p>
              Don’t have an account?{" "}
              <a href="#" onClick={() => setActive(true)}>Sign Up</a>
            </p>
          </div>

          <div className="regi-link animation" style={{ "--S": 6 }}>
            <p>
              <a href="#" onClick={(e) => { e.preventDefault(); setActivePanel("forgot"); }}>
                Forgot Password?
              </a>
            </p>
          </div>

          {msg && (
            <p style={{ color: msg.type === "error" ? "red" : "lightgreen" }}>
              {msg.text}
            </p>
          )}
        </form>
      </div>

      {/* Right side text */}
      <div className="info-content Login">
        <h2 className="animation" style={{ "--S": 1 }}>Welcome Back!</h2>
        <p className="animation" style={{ "--S": 2 }}>
          To stay connected with us, please login with your personal info.
        </p>
      </div>
    </>
  );
}
