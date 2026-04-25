import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: AdminDashboard");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin portal.</p>
    </div>
  );
}
