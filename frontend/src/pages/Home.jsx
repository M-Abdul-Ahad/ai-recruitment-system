import { Link } from "react-router-dom";

export default function Home() {
  const styles = {
    container: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" },
    header: { fontSize: "2.5rem", marginBottom: "1rem" },
    subheader: { fontSize: "1.2rem", color: "#555", marginBottom: "2rem" },
    buttonGroup: { display: "flex", gap: "1rem" },
    button: { padding: "0.75rem 1.5rem", textDecoration: "none", borderRadius: "4px", fontWeight: "bold" },
    loginBtn: { backgroundColor: "#007BFF", color: "white" },
    signupBtn: { backgroundColor: "#28A745", color: "white" }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>AI Recruitment System</h1>
      <p style={styles.subheader}>Streamlining the hiring process with AI</p>
      <div style={styles.buttonGroup}>
        <Link to="/login" style={{...styles.button, ...styles.loginBtn}}>Log In</Link>
        <Link to="/signup" style={{...styles.button, ...styles.signupBtn}}>Sign Up</Link>
      </div>
    </div>
  );
}
