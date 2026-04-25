import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("applicant");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      // Backend expects 'username' instead of 'name' typically,
      // but we send the requested shape mapped to backend fields.
      await signup({ username: name, email, password, role });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed. Please try again.");
    }
  };

  const styles = {
    container: { maxWidth: "400px", margin: "3rem auto", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px" },
    formGroup: { marginBottom: "1rem" },
    label: { display: "block", marginBottom: "0.5rem" },
    input: { width: "100%", padding: "0.5rem", boxSizing: "border-box" },
    select: { width: "100%", padding: "0.5rem" },
    button: { width: "100%", padding: "0.75rem", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
    linkContainer: { marginTop: "1rem", textAlign: "center" }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>I am a:</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={styles.select}>
            <option value="applicant">Applicant (Looking for jobs)</option>
            <option value="recruiter">Recruiter (Hiring for a company)</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={styles.input} required />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required minLength={8} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={styles.input} required minLength={8} />
        </div>

        <button type="submit" style={styles.button}>Sign up as {role === "applicant" ? "Applicant" : "Recruiter"}</button>
      </form>
      <div style={styles.linkContainer}>
        <Link to="/login" style={{ color: "#007BFF", textDecoration: "none" }}>Already have an account? Login</Link>
      </div>
    </div>
  );
}
