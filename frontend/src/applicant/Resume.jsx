import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Resume() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: ApplicantResume");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Applicant Resume</h1>
      <p>Manage your resume here.</p>
    </div>
  );
}
