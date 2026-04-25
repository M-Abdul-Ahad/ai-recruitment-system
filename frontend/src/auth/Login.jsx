import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("LOGIN REQUEST:", { email, password });
    try {
      await login({ email, password });
      // The login function in AuthContext handles logging the response and storing
      // We will assume the context sets the user successfully.
      console.log("REDIRECTING BASED ON ROLE");
      navigate("/");
    } catch (err) {
      alert("Login failed. Check your credentials.");
    }
  };

  const styles = {
    container: { maxWidth: "400px", margin: "3rem auto", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" },
    formGroup: { marginBottom: "1rem" },
    label: { display: "block", marginBottom: "0.5rem" },
    input: { width: "100%", padding: "0.5rem", boxSizing: "border-box" },
    button: { width: "100%", padding: "0.75rem", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    linkContainer: { marginTop: "1rem", textAlign: "center" }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email or Username</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
        </div>
        <button type="submit" style={styles.button}>Log in</button>
      </form>
      <div style={styles.linkContainer}>
        <Link to="/signup" style={{ color: "#007BFF", textDecoration: "none" }}>Don't have an account? Signup</Link>
      </div>
    </div>
  );
}
