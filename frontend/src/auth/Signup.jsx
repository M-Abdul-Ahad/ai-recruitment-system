import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. ADD DEBUG LOGS
    console.log("Current formData state:", formData);
    console.log("Current role value:", formData.role);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    // 2. FIX ROLE VALUE & 5. VERIFY API PAYLOAD
    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role.toLowerCase()
    };
    
    console.log("API Payload before call:", payload);

    try {
      await signup(payload);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      // Log API error
      console.error("API Error during signup:", err);
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
          {/* 3. FIX SELECT INPUT & 4. VERIFY STATE UPDATE */}
          <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={styles.select}>
            <option value="applicant">Applicant</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={styles.input} required />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={styles.input} required minLength={8} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} style={styles.input} required minLength={8} />
        </div>

        <button type="submit" style={styles.button}>Sign up as {formData.role === "applicant" ? "Applicant" : "Recruiter"}</button>
      </form>
      <div style={styles.linkContainer}>
        <Link to="/login" style={{ color: "#007BFF", textDecoration: "none" }}>Already have an account? Login</Link>
      </div>
    </div>
  );
}
