import { useState } from "react";
import Login from "./components/login";
import Signup from "./components/signup";
import "./styles/style.css";

export default function App() {
  const [active, setActive] = useState(false); // false = login, true = signup

  return (
    <div className={`container ${active ? "active" : ""}`}>
      {/* Background shapes */}
      <div className="curved-shape"></div>
      <div className="curved-shape2"></div>

      {/* LOGIN FORM */}
      <Login setActive={setActive} />

      {/* SIGNUP FORM */}
      <Signup setActive={setActive} />
    </div>
  );
}
