import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Company() {
  const { user } = useContext(AuthContext);
  console.log("PAGE LOADED: CompanyProfile");
  console.log("CURRENT USER:", user);
  
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Company Profile</h1>
      <p>Manage company details here.</p>
    </div>
  );
}
