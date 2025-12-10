// src/App.js
import { useState } from "react";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./components/dashboard";
import ForgotPassword from "./components/ForgotPassword";
import "./styles/style.css";

export default function App() {
  const [active, setActive] = useState(false); // false = login, true = signup
  const [user, setUser] = useState(null); // logged-in user
  const [showForgot, setShowForgot] = useState(false);

  if (user) {
    return <Dashboard user={user} onLogout={() => setUser(null)} />;
  }

  if (showForgot) {
    return (
      // full-screen forgot password view
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f1f23" }}>
        <ForgotPassword onBack={() => setShowForgot(false)} />
      </div>
    );
  }

  return (
    <div className={`container ${active ? "active" : ""}`}>
      <div className="curved-shape"></div>
      <div className="curved-shape2"></div>

      <Login setActive={setActive} setUser={setUser} onForgot={() => setShowForgot(true)} />
      <Signup setActive={setActive} />

      <div className="info-content Login">
        <h2 className="animation" style={{ "--S": 1 }}>Welcome Back!</h2>
        <p className="animation" style={{ "--S": 2 }}>
          To stay connected with us, please login with your personal info.
        </p>
      </div>

      <div className="info-content Register">
        <h2 className="animation" style={{ "--li": 1 }}>WELCOME!</h2>
        <p className="animation" style={{ "--li": 2 }}>
          Join us by creating your account and start your journey today.
        </p>
      </div>
    </div>
  );
}
