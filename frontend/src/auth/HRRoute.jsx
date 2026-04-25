import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function HRRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  console.log("HRRoute - user:", user);

  if (loading) {
    console.log("Still loading auth state...");
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();

  if (role !== "recruiter" || !user.is_hr) {
    console.log("User is NOT HR → redirect unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
