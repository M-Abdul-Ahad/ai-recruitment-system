import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function HRDashboard() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: HRDashboard");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>HR Dashboard</h1>
      <p>Manage HR duties and team members.</p>
    </div>
  );
}
