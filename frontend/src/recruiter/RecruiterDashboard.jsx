import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const RecruiterDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("PAGE LOADED: Recruiter Dashboard");
  console.log("CURRENT USER:", user);

  const handleLogout = () => {
      console.log("LOGOUT CLICKED");
      logout();
      navigate("/login");
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1>Recruiter Dashboard</h1>
          <div>
            <p><strong>{user?.email}</strong></p>
            <p style={{ color: "#777" }}>Role: {user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>

        <Link to="/recruiter/jobs" style={styles.card}>
          <h2>📋 Jobs</h2>
          <p>View and manage all job postings</p>
        </Link>

        <Link to="/recruiter/jobs/create" style={styles.card}>
          <h2>➕ Create Job</h2>
          <p>Create a job and generate JD using AI</p>
        </Link>

        <Link to="/recruiter/shortlist/1" style={styles.card}>
          <h2>🤖 Shortlist Candidates</h2>
          <p>Upload resumes & match with JD</p>
        </Link>

        <Link to="/recruiter/company" style={styles.card}>
          <h2>🏢 Company & HR</h2>
          <p>Manage company details and HR members</p>
        </Link>

      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>AI-powered recruitment system 🚀</p>
      </div>
    </div>
  );
};

export default RecruiterDashboard;

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },

  card: {
    textDecoration: "none",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    color: "#333",
    transition: "all 0.2s ease",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    color: "#888",
  },
};