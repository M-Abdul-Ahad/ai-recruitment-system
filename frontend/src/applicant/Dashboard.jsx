import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: ApplicantDashboard");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Applicant Dashboard</h1>
      <p>Welcome to the applicant portal.</p>
    </div>
  );
}
