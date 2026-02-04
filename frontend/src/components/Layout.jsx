import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import pie from "../assets/images/auth/pie.png";
import "../styles/dashboard.css";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  /* ===== SYNC USER SAFELY ===== */
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Forever";

  /* ===== PAGE TITLE MAP ===== */
  const pageTitleMap = {
    "/dashboard": "Home",
    "/products": "Products",
    "/invoices": "Invoices",
    "/statistics": "Statistics",
    "/settings": "Settings",
  };

  const pageTitle = pageTitleMap[location.pathname] || "Dashboard";

  const showSearch =
    location.pathname === "/products" ||
    location.pathname === "/invoices";

  /* ===== ACTIONS ===== */
  const toggleLogout = (e) => {
    e.stopPropagation();
    setShowLogout((prev) => !prev);
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-root">
      {/* ================= SIDEBAR ================= */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="dashboard-logo">
            <img src={pie} alt="Logo" width={36} />
          </div>

          <div className="sidebar-divider" />

          <nav className="dashboard-nav">
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
              <Icon icon="mdi:home-outline" />
              <span>Home</span>
            </Link>

            <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>
              <Icon icon="mdi:package-variant-closed" />
              <span>Products</span>
            </Link>

            <Link to="/invoices" className={location.pathname === "/invoices" ? "active" : ""}>
              <Icon icon="mdi:file-document-outline" />
              <span>Invoices</span>
            </Link>

            <Link to="/statistics" className={location.pathname === "/statistics" ? "active" : ""}>
              <Icon icon="mdi:chart-box-outline" />
              <span>Statistics</span>
            </Link>

            <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
              <Icon icon="mdi:cog-outline" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="dashboard-user" onClick={toggleLogout}>
            {displayName}
          </div>

          {showLogout && (
            <button className="dashboard-logout" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>{pageTitle}</h1>

          {showSearch && (
            <div className="dashboard-search">
              <Icon icon="mdi:magnify" />
              <input placeholder="Search here..." />
            </div>
          )}
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
