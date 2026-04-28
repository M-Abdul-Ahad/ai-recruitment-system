import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("ADMIN DASHBOARD LOADED");

  const handleLogout = () => {
      console.log("LOGOUT CLICKED");
      logout();
      navigate("/login");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p style={styles.subtitle}>System Control Panel</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.grid}>
        <Link to="/admin/users" style={styles.card}>
          <h2>👤 Users</h2>
          <p>Manage all users (Applicants, Recruiters, HR)</p>
        </Link>

        <Link to="/admin/companies" style={styles.card}>
          <h2>🏢 Companies</h2>
          <p>View and manage companies</p>
        </Link>

        <Link to="/admin/jobs" style={styles.card}>
          <h2>💼 Jobs</h2>
          <p>Monitor all job postings</p>
        </Link>
      </div>

      <div style={styles.footer}>
        <p>Admin controls the entire platform ⚙️</p>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* -------- STYLES -------- */

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  logoutBtn: {
    padding: "8px 16px",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    textDecoration: "none",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    color: "#333",
    transition: "0.2s",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
    color: "#888",
  },
};