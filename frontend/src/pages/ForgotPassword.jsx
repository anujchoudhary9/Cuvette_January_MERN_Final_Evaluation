import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

/* ===== IMAGE IMPORT (VITE SAFE) ===== */
import forgotIllustration from "../assets/images/auth/forgot-password.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      const res = await fetch(
        "https://cuvette-january-mern-final-evaluation-3fcr.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      localStorage.setItem("resetEmail", email);
      navigate("/verify-otp");
    } catch {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="login-page forgot-password">
      <div className="login-left">
        <h2>Company name</h2>

        <p className="subtitle">
          Please enter your registered email ID to receive an OTP
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>E-mail</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Send Mail
          </button>
        </form>
      </div>

      <div className="login-right">
        <img
          src={forgotIllustration}
          alt="Forgot password illustration"
          className="login-illustration"
        />
      </div>
    </div>
  );
}

export default ForgotPassword;

