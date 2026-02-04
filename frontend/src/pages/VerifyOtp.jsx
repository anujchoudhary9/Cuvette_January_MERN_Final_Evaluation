import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/login.css";

/* ===== IMAGE IMPORT (VITE SAFE) ===== */
import otpIllustration from "../assets/images/auth/otp.png";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    navigate("/reset-password");
  };

  return (
    <div className="login-page">
      {/* LEFT PANEL */}
      <div className="login-left forgot-password">
        <h2>Enter Your OTP</h2>

        <p className="subtitle">
          We&apos;ve sent a 6-digit OTP to your registered mail.
          <br />
          Please enter it below to sign in.
        </p>

        <form onSubmit={handleSubmit}>
          <label>OTP</label>
          <input
            type="text"
            placeholder="xxxx05"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Confirm
          </button>
        </form>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <img
          src={otpIllustration}
          alt="OTP Illustration"
          className="login-illustration"
        />
      </div>
    </div>
  );
}

export default VerifyOtp;
