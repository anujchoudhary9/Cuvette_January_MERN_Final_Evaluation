import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/login.css";

/* ===== IMAGE IMPORTS (VITE SAFE) ===== */
import loginIllustration from "../assets/images/auth/login.png";
import pieImage from "../assets/images/auth/pie.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await fetch(
        "https://cuvette-january-mern-final-evaluation.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      login(data.user, data.token);
      navigate("/dashboard");
    } catch {
      setError("Failed to connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h2>Log in to your account</h2>
        <p className="subtitle">
          Welcome back! Please enter your details.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
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

          <div className="forgot">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="login-btn">
            Sign in
          </button>
        </form>

        <p className="signup-link">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>

      <div className="login-right">
        <h1>
          Welcome to <br />
          Company Name
        </h1>

        <img
          src={loginIllustration}
          alt="Login Illustration"
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

export default Login;
