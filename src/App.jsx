import { useState } from "react";
import "./styles/style.css";

export default function App() {
  const [active, setActive] = useState(false);

  return (
    <div className={`container ${active ? "active" : ""}`}>
      {/* Animated curved backgrounds */}
      <div className="curved-shape"></div>
      <div className="curved-shape2"></div>

      {/* LOGIN FORM */}
      <div className="form-box Login">
        <h2 className="animation" style={{ "--S": 1 }}>
          Login
        </h2>

        <form action="#">
          <div className="input-box animation" style={{ "--S": 2 }}>
            <input type="text" required />
            <label>Username</label>
            <box-icon type="solid" name="user" color="gray"></box-icon>
          </div>

          <div className="input-box animation" style={{ "--S": 3 }}>
            <input type="password" required />
            <label>Password</label>
            <box-icon name="lock-alt" type="solid" color="gray"></box-icon>
          </div>

          <div className="input-box animation" style={{ "--S": 4 }}>
            <button className="btn" type="submit">Login</button>
          </div>

          <div className="regi-link animation" style={{ "--S": 5 }}>
            <p>
              Don’t have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActive(true);
                }}
              >
                Sign Up
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* LOGIN INFO PANEL */}
      <div className="info-content Login">
        <h2 className="animation" style={{ "--S": 1 }}>
          Welcome Back!
        </h2>
        <p className="animation" style={{ "--S": 2 }}>
          To stay connected with us, please login with your personal info.
        </p>
      </div>

      {/* REGISTER FORM */}
      <div className="form-box Register">
        <h2 className="animation" style={{ "--li": 1 }}>
          Register
        </h2>

        <form action="#">
          <div className="input-box animation" style={{ "--li": 2 }}>
            <input type="text" required />
            <label>Username</label>
            <box-icon type="solid" name="user" color="gray"></box-icon>
          </div>

          <div className="input-box animation" style={{ "--li": 3 }}>
            <input type="email" required />
            <label>Email</label>
            <box-icon name="envelope" type="solid" color="gray"></box-icon>
          </div>

          <div className="input-box animation" style={{ "--li": 4 }}>
            <input type="password" required />
            <label>Password</label>
            <box-icon name="lock-alt" type="solid" color="gray"></box-icon>
          </div>

          <div className="input-box animation" style={{ "--li": 5 }}>
            <button className="btn" type="submit">Register</button>
          </div>

          <div className="regi-link animation" style={{ "--li": 6 }}>
            <p>
              Already have an account?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActive(false);
                }}
              >
                Sign In
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* REGISTER INFO PANEL */}
      <div className="info-content Register">
        <h2 className="animation" style={{ "--li": 1 }}>
          Welcome!
        </h2>
        <p className="animation" style={{ "--li": 2 }}>
          Join us by creating your account and start your journey today.
        </p>
      </div>
    </div>
  );
}
