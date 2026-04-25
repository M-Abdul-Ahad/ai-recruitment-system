import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function RecruiterDashboard() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: RecruiterDashboard");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Recruiter Dashboard</h1>
      <p>Welcome to the recruiter portal.</p>
    </div>
  );
}
