import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

const Company = () => {
  const { user } = useContext(AuthContext);

  console.log("PAGE LOADED: Company Management");

  return (
    <div>
      <h1>Company & HR Management</h1>

      <h3>Company Info</h3>
      <p>Company Name: Demo Company</p>

      <h3>HR Members</h3>
      <ul>
        <li>hr1@example.com</li>
        <li>hr2@example.com</li>
      </ul>

      <button>Add HR</button>
    </div>
  );
};

export default Company;