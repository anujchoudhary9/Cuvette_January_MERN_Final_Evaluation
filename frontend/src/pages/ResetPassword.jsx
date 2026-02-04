import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

/* ===== IMAGE IMPORT (VITE SAFE) ===== */
import resetIllustration from "../assets/images/auth/reset-password.png";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    navigate("/login");
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left">
        <h2>Create New Password</h2>

        <p className="subtitle">
          Today is a new day. It&apos;s your day. You shape it.
          <br />
          Sign in to start managing your projects.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Enter New Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="at least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              👁
            </button>
          </div>

          <label>Confirm Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="at least 8 characters"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              👁
            </button>
          </div>

          <button type="submit" className="login-btn">
            Reset Password
          </button>
        </form>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <img
          src={resetIllustration}
          alt="Reset password illustration"
          className="login-illustration"
        />
      </div>
    </div>
  );
}

export default ResetPassword;
