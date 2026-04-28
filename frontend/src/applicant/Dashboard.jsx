import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("PAGE LOADED: Applicant Dashboard");
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
          <h1>Applicant Dashboard</h1>
          <div>
            <p><strong>{user?.email}</strong></p>
            <p style={{ color: "#666" }}>Role: {user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2>🚀 Quick Actions</h2>

        <div style={styles.grid}>
          <Link to="/applicant/resume" style={styles.card}>
            <h3>📄 Resume Analysis</h3>
            <p>Upload resume & get AI feedback</p>
          </Link>

          <Link to="/applicant/builder" style={styles.card}>
            <h3>🤖 Resume Builder</h3>
            <p>Generate resume using AI</p>
          </Link>

          <Link to="/applicant/jobs" style={styles.card}>
            <h3>💼 Jobs</h3>
            <p>Browse available jobs</p>
          </Link>

          <Link to="/applicant/applications" style={styles.card}>
            <h3>📌 Applications</h3>
            <p>Track your applications</p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>Welcome to your AI-powered career assistant 🚀</p>
      </div>
    </div>
  );
};

export default Dashboard;

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9fafb",
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

  section: {
    marginTop: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "15px",
  },

  card: {
    textDecoration: "none",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    color: "#333",
    transition: "0.2s",
  },

  footer: {
    marginTop: "40px",
    textAlign: "center",
    color: "#888",
  },
};