// src/LoginCard.jsx
import React from "react";
import './style.css'; // optional — import your CSS if styles are in style.css or App.css

export default function LoginCard() {
  return (
    <div className="box">
      <div className="login">
        <div className="loginBx">
          <h2>
            <i className="fa-solid fa-right-to-bracket"></i> Login
          </h2>

          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <input type="submit" value="Login" />

          <div className="group">
            <a href="#">Forgot Password</a>
            <a href="#">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
