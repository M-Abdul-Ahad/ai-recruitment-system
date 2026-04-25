import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  console.log("RoleRoute - user:", user);
  console.log("RoleRoute - allowedRoles:", allowedRoles);

  if (loading) {
    console.log("Still loading auth state...");
    return <div>Loading...</div>;
  }

  if (!user) {
    console.log("No user → redirect login");
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toLowerCase();
  console.log("Normalized role:", role);

  if (!allowedRoles.includes(role)) {
    console.log("Role NOT allowed → redirect unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("Access granted");
  return children;
}
