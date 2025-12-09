import React, { useState } from "react";

export default function Signup({ setActive }) {
  const [form, setForm] = useState({
    name: "",
    phone_no: "",
    dob: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === "phone_no") value = value.replace(/\D/g, "");
    setForm({ ...form, [name]: value });
  }

  async function submitSignup(e) {
    e.preventDefault();
    setMsg(null);

    const { name, phone_no, dob, email, password } = form;

    if (!name || !phone_no || !dob || !email || !password) {
      return setMsg({ type: "error", text: "All fields required" });
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: "Registered successfully!" });
        setForm({ name: "", phone_no: "", dob: "", email: "", password: "" });

        // switch to login page
        setTimeout(() => setActive(false), 800);
      }
    } catch {
      setMsg({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="form-box Register">
        <h2 className="animation" style={{ "--li": 1 }}>Register</h2>

        <form onSubmit={submitSignup}>
          <div className="input-box animation" style={{ "--li": 2 }}>
            <input
              type="text"
              name="name"
              placeholder=" "
              required
              value={form.name}
              onChange={handleChange}
            />
            <label>Username</label>
          </div>

          <div className="input-box animation" style={{ "--li": 3 }}>
            <input
              type="tel"
              name="phone_no"
              placeholder=" "
              required
              value={form.phone_no}
              onChange={handleChange}
            />
            <label>Phone Number</label>
          </div>

          <div className="input-box animation" style={{ "--li": 4 }}>
            <input
              type="date"
              name="dob"
              required
              value={form.dob}
              onChange={handleChange}
            />
            <label>Date of Birth</label>
          </div>

          <div className="input-box animation" style={{ "--li": 5 }}>
            <input
              type="email"
              name="email"
              placeholder=" "
              required
              value={form.email}
              onChange={handleChange}
            />
            <label>Email</label>
          </div>

          <div className="input-box animation" style={{ "--li": 6 }}>
            <input
              type="password"
              name="password"
              placeholder=" "
              required
              value={form.password}
              onChange={handleChange}
            />
            <label>Password</label>
          </div>

          <div className="input-box animation" style={{ "--li": 8 }}>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          {msg && (
            <p style={{ color: msg.type === "error" ? "red" : "green" }}>
              {msg.text}
            </p>
          )}

          <div className="regi-link animation" style={{ "--li": 9 }}>
            <p>
              Already have an account?{" "}
              <a href="#" onClick={() => setActive(false)}>Log In</a>
            </p>
          </div>
        </form>
      </div>

      {/* Info panel (left side text) */}
      <div className="info-content Register">
        <h2 className="animation" style={{ "--li": 1 }}>WELCOME!</h2>
        <p className="animation" style={{ "--li": 2 }}>
          Join us by creating your account and start your journey today.
        </p>
      </div>
    </>
  );
}
