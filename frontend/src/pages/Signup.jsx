import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

/* ===== IMAGE IMPORTS (VITE SAFE) ===== */
import signupIllustration from "../assets/images/auth/signup.png";
import pieImage from "../assets/images/auth/pie.png";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "https://cuvette-january-mern-final-evaluation.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      navigate("/login");
    } catch {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h2>Create an account</h2>
        <p className="subtitle">Start inventory management.</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Create Password</label>
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
            Sign up
          </button>
        </form>

        <p className="signup-link">
          Do you have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="login-right">
        <h1>
          Welcome to <br />
          Company Name
        </h1>

        <img
          src={signupIllustration}
          alt="Signup Illustration"
          className="login-illustration"
        />

        <img
          src={pieImage}
          alt="Pie"
          className="pie"
        />
      </div>
    </div>
  );
}

export default Signup;
