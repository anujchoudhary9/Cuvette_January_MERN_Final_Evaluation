import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../styles/settings.css";

function Settings() {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!storedUser) return;

    if (storedUser.name) {
      const parts = storedUser.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }

    setEmail(storedUser.email || "");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("token");

    // ✅ ONLY send what actually changed
    const payload = {
      name: [firstName, lastName].filter(Boolean).join(" "),
    };

    // ✅ ONLY send password if user entered one
    if (password.trim().length > 0) {
      if (password.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }
      payload.password = password;
    }

    const res = await fetch(
      "https://cuvette-january-mern-final-evaluation-3fcr.onrender.com/api/auth/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update profile");
      return;
    }

    // ✅ TRUST BACKEND RESPONSE ONLY
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("user-updated"));

    // ✅ CLEAR PASSWORD FIELDS
    setPassword("");
    setConfirmPassword("");

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-panel">
          <div className="settings-header">
            Edit Profile
            <div className="settings-divider" />
          </div>

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-left">
              <div className="field">
                <label>First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input value={email} disabled />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="password">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    👁
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div className="password">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    👁
                  </button>
                </div>
              </div>
            </div>

            <div className="actions">
              <button type="submit">Save</button>
            </div>

            {saved && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#16a34a",
                }}
              >
                Profile updated successfully
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
